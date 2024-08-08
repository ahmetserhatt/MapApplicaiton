const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
        }),
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([35.2433, 38.9637]), // Türkiye'nin koordinatları
        zoom: 6,
    }),
});




const vectorSource = new ol.source.Vector({ wrapX: false });
const vectorLayer = new ol.layer.Vector({ source: vectorSource });
map.addLayer(vectorLayer);


const popupElement = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');


async function fetchPoints() {
    try {
        const response = await fetch('http://localhost:5102/api/point');
        const data = await response.json();
        if (data.success) {
            addPointsToMap(data.data);
            toastr.success('Points fetched successfully!');
        } else {
            toastr.error(data.message);
        }
    } catch (error) {
        toastr.error('Error fetching points: ' + error);
    }
}

function addPointsToMap(features) {
    vectorSource.clear();
    features.forEach(feature => {
        const format = new ol.format.WKT();
        let geom;

        try {
            geom = format.readGeometry(feature.wkt, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
        } catch (error) {
            console.error("Geometri okunamadı:", error);
            return;
        }

        const featureObj = new ol.Feature({
            geometry: geom
        });

        featureObj.set('name', feature.name);
        featureObj.set('id', feature.id);

        let style;
        if (geom.getType() === 'Point') {
            style = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: 'icons/marker-icon.png'
                })
            });
        } else if (geom.getType() === 'Polygon') {
            style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                })
            });
        } else if (geom.getType() === 'LineString') {
            style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 3
                })
            });
        }

        featureObj.setStyle(style);
        vectorSource.addFeature(featureObj);
    });
}

// Event listeners for UI elements
document.getElementById('addPointBtn').addEventListener('click', () => {
    document.getElementById('addPointForm').classList.remove('hidden');
});

document.getElementById('queryPointsBtn').addEventListener('click', async () => {
    await queryPoints();
    $('#queryResults').modal();
});

document.getElementById('savePointBtn').addEventListener('click', async () => {
    const wkt = document.getElementById('wktCoord').value;
    const name = document.getElementById('pointName').value;
    const id = document.getElementById('pointId').value || 0;
    if (id == 0) {
        await addPoint({ id: 0, wkt: wkt, name: name });
    } else {
        await updatePoint({ id: parseInt(id), wkt: wkt, name: name });
    }
});

document.getElementById('cancelAddBtn').addEventListener('click', () => {
    document.getElementById('addPointForm').classList.add('hidden');
});


async function addPoint(point) {
    try {
        const response = await fetch('http://localhost:5102/api/point', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(point)
        });
        const data = await response.json();
        if (data.success) {
            fetchPoints();
            document.getElementById('addPointForm').classList.add('hidden');
            toastr.success('Point added successfully!');
        } else {
            toastr.error(data.message);
        }
    } catch (error) {
        toastr.error('Error adding point: ' + error);
    }
}

async function updatePoint(point) {
    try {
        const response = await fetch(`http://localhost:5102/api/point/${point.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(point)
        });
        const data = await response.json();
        if (data.success) {
            fetchPoints();
            document.getElementById('addPointForm').classList.add('hidden');
            toastr.success('Point updated successfully!');
        } else {
            toastr.error(data.message);
        }
    } catch (error) {
        toastr.error('Error updating point: ' + error);
    }
}

async function queryPoints() {
    try {
        const response = await fetch('http://localhost:5102/api/point');
        const data = await response.json();
        if (data.success) {
            $('#pointsTable').DataTable().clear().destroy();
            const tableBody = document.querySelector('#pointsTable tbody');
            tableBody.innerHTML = '';
            data.data.forEach(point => {
                const formattedWKT = formatWKT(point.wkt);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${point.id}</td>
                    <td>${point.name}</td>
                    <td>${formattedWKT}</td>
                    <td>
                        <button class="showBtn" data-id="${point.id}" data-wkt="${point.wkt}">Show</button>
                        <button class="editBtn" data-id="${point.id}" data-wkt="${point.wkt}" data-name="${point.name}">Edit</button>
                        <button class="calculateAreaBtn" data-id="${point.id}" data-wkt="${point.wkt}">Calculate</button>
                        <button class="deleteBtn" data-id="${point.id}">Delete</button>
                        
                    </td>
                `;
                tableBody.appendChild(row);
            });
            $('#pointsTable').DataTable({
                responsive: true,
                scrollY: '50vh',
                scrollCollapse: true,
                paging: false,
                autoWidth: false
            });
            document.querySelectorAll('.showBtn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const wkt = this.getAttribute('data-wkt');
                    showGeometryOnMap(wkt);
                    $.modal.close();
                });
            });
            document.querySelectorAll('.editBtn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const wkt = this.getAttribute('data-wkt');
                    const name = this.getAttribute('data-name');
                    editPoint({ id: id, wkt: wkt, name: name });
                    $.modal.close();
                });
            });
            document.querySelectorAll('.deleteBtn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const id = this.getAttribute('data-id');
                    await deletePoint(id);
                    $.modal.close();
                });
            });
            document.querySelectorAll('.calculateAreaBtn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const wkt = this.getAttribute('data-wkt');
                    calculateArea(wkt);
                });
            });
        } else {
            toastr.error(data.message);
        }
    } catch (error) {
        toastr.error('Error querying points: ' + error);
    }
}

function calculateArea(wkt) {
    try {
        const format = new ol.format.WKT();
        // Geometriyi EPSG:4326'da oku ve EPSG:3857'ye dönüştür
        const geometry = format.readGeometry(wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        if (geometry.getType() === 'Polygon') {
            // Alanı hesapla
            const areaInSquareMeters = ol.sphere.getArea(geometry);
            const areaInSquareKilometers = areaInSquareMeters / 1_000_000;
            toastr.success('Area: ' + areaInSquareKilometers.toFixed(2) + ' square kilometers');
        } 
        else if (geometry.getType() === 'LineString') {
            const lineMeter = ol.sphere.getLength(geometry);
            const lineMeterKilometers = lineMeter / 1_000;
            toastr.success(`Length: ${lineMeterKilometers} kilometers`);
        }else {
            toastr.error('Selected geometry is not a polygon');
        }
    } catch (error) {
        toastr.error('Error calculating area: ' + error);
    }
}



function formatWKT(wkt) {
    const maxLength = 60; // gösterirken aşağı satıra insin
    if (wkt.length > maxLength) {
        const parts = [];
        for (let i = 0; i < wkt.length; i += maxLength) {
            parts.push(wkt.slice(i, i + maxLength));
        }
        return parts.join('<br>');
    }
    const pointMatch = wkt.match(/POINT\(([\d.]+) ([\d.]+)\)/);
    if (pointMatch) {
        const formattedLon = parseFloat(pointMatch[1]).toFixed(2);
        const formattedLat = parseFloat(pointMatch[2]).toFixed(2);
        return `POINT(${formattedLon} ${formattedLat})`;
    }
    const lineStringMatch = wkt.match(/LINESTRING\((.+)\)/);
    if (lineStringMatch) {
        const formattedCoords = lineStringMatch[1].split(',').map(coord => {
            const [lon, lat] = coord.trim().split(' ');
            return `${parseFloat(lon).toFixed(2)} ${parseFloat(lat).toFixed(2)}`;
        }).join(', ');
        return `LINESTRING(${formattedCoords})`;
    }
    const polygonMatch = wkt.match(/POLYGON\(\((.+)\)\)/);
    if (polygonMatch) {
        const formattedCoords = polygonMatch[1].split(',').map(coord => {
            const [lon, lat] = coord.trim().split(' ');
            return `${parseFloat(lon).toFixed(2)} ${parseFloat(lat).toFixed(2)}`;
        }).join(', ');
        return `POLYGON((${formattedCoords}))`;
    }
    return wkt;
}

function editPoint(point) {
    document.getElementById('wktCoord').value = point.wkt;
    document.getElementById('pointName').value = point.name;
    document.getElementById('pointId').value = point.id;
    document.getElementById('addPointForm').classList.remove('hidden');
}

async function deletePoint(id) {
    try {
        const response = await fetch(`http://localhost:5102/api/point/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
            queryPoints();
            toastr.success('Point deleted successfully!');
        } else {
            toastr.error('Failed to delete point: ' + data.message);
        }
    } catch (error) {
        toastr.error('Error deleting point: ' + error);
    }
}

function showGeometryOnMap(wkt) {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    const view = map.getView();
    const extent = feature.getGeometry().getExtent();
    const center = ol.extent.getCenter(extent);
    view.animate({
        center: center,
        zoom: 12,
        duration: 2000
    });
}

map.on('singleclick', function (event) {
    if(singleButtonClicked) return;
    popupElement.style.display = 'none';
    const features = map.getFeaturesAtPixel(event.pixel);
    if (features.length > 0) {
        const feature = features[0];
        const coordinates = ol.proj.toLonLat(feature.getGeometry().getCoordinates());
        const pointId = feature.get('id');
        const pointName = feature.get('name');
        const content = `<p><strong>Name:</strong> ${pointName}</p><p><strong>Coordinates:</strong> ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}</p>`;
        popupContent.innerHTML = content;
        popupElement.style.display = 'block';
        const overlay = new ol.Overlay({
            element: popupElement,
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -50]
        });
        map.addOverlay(overlay);
        overlay.setPosition(event.coordinate);
        popupElement.setAttribute('data-id', pointId);
        popupElement.setAttribute('data-name', pointName);
    } else {
        const coords = ol.proj.toLonLat(event.coordinate);
        const wkt = `POINT(${coords[0].toFixed(6)} ${coords[1].toFixed(6)})`;
        document.getElementById('wktCoord').value = wkt;
        document.getElementById('pointId').value = 0;
        document.getElementById('addPointForm').classList.remove('hidden');
    }
});

document.getElementById('update').addEventListener('click', updateItem);
document.getElementById('delete').addEventListener('click', deleteItem);

function updateItem() {
    const id = popupElement.getAttribute('data-id');
    const name = popupElement.getAttribute('data-name');
    const coordinates = ol.proj.toLonLat(map.getView().getCenter());
    const wkt = `POINT(${coordinates[0].toFixed(6)} ${coordinates[1].toFixed(6)})`;
    editPoint({ id: id, wkt: wkt, name: name });
}

function deleteItem() {
    const id = popupElement.getAttribute('data-id');
    deletePoint(id);
}

fetchPoints();


const modify = new ol.interaction.Modify({ source: vectorSource });


modify.on('modifyend', async function (event) {
    event.features.forEach(async feature => {
        const geometry = feature.getGeometry();
        let updatedPoint;
        if (geometry.getType() === 'Point') {
            const coordinates = ol.proj.toLonLat(geometry.getCoordinates());
            const wkt = `POINT(${coordinates[0].toFixed(6)} ${coordinates[1].toFixed(6)})`;
            updatedPoint = { id: feature.get('id'), wkt: wkt, name: feature.get('name') };
        } else if (geometry.getType() === 'Polygon' || geometry.getType() === 'LineString') {
            const format = new ol.format.WKT();
            const wkt = format.writeGeometry(geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            updatedPoint = { id: feature.get('id'), wkt: wkt, name: feature.get('name') };
        } else {
            console.warn('Unsupported geometry type for modification:', geometry.getType());
            return;
        }
        try {
            const response = await fetch(`http://localhost:5102/api/point/${updatedPoint.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPoint)
            });
            const data = await response.json();
            if (data.success) {
                toastr.success('Point updated successfully!');
            } else {
                toastr.error('Failed to update point: ' + data.message);
            }
        } catch (error) {
            toastr.error('Error updating point: ' + error);
        }
    });
});


let editMode = false;

const toggleEditBtn = document.getElementById('toggleEditBtn');
toggleEditBtn.classList.add('toggle-btn'); 
toggleEditBtn.addEventListener('click', () => {
    editMode = !editMode;
    if (editMode) {
        toggleEditBtn.classList.add('active');
        toastr.info('Edit mode enabled');
        map.addInteraction(modify);
    } else {
        toggleEditBtn.classList.remove('active');
        toastr.info('Edit mode disabled');
        map.removeInteraction(modify);
    }
});


let singleButtonClicked = false;
document.getElementById('drawPolygonBtn').addEventListener('click', function () {
    singleButtonClicked = true;
    const drawPolygon = new ol.interaction.Draw({
        source: vectorSource,
        type: 'Polygon',
    });
    map.addInteraction(drawPolygon);
    drawPolygon.on('drawend', function (event) {
        const polygon = event.feature.getGeometry();
        const wkt = new ol.format.WKT().writeGeometry(polygon, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        map.removeInteraction(drawPolygon);
        const name = prompt('Enter name for the polygon:');
        if (name) {
            addPoint({ id: 0, wkt: wkt, name: name });
        }
        singleButtonClicked =false;
    });
});

document.getElementById('drawLineBtn').addEventListener('click', function () {
    singleButtonClicked = true;
    const drawLine = new ol.interaction.Draw({
        source: vectorSource,
        type: 'LineString',
    });
    map.addInteraction(drawLine);
    drawLine.on('drawend', function (event) {
        const line = event.feature.getGeometry();
        const wkt = new ol.format.WKT().writeGeometry(line, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        map.removeInteraction(drawLine);
        const name = prompt('Enter name for the line:');
        if (name) {
            addPoint({ id: 0, wkt: wkt, name: name });
        }
        singleButtonClicked=false;
    });
});

