# Harita Uygulaması

Bu proje, bir harita üzerinde nokta, poligon ve çizgi değerlerinin yönetimini sağlamak amacıyla geliştirilmiştir. ASP.NET Core, SQL, HTML, CSS ve Javascript kullanılarak oluşturulan bu uygulama, noktaların CRUD işlemlerini veritabanı ile entegre bir şekilde gerçekleştirebilmektedir.

## Kurulum

Bu projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları takip edin.

1- Kodu bilgisayarınıza indirin.
2- Veritabanı bağlantısını oluşturun
3- ASP.NET ile swaggerden back-end kısmının çalışıp çalışmadığını kontrol edin.
4- Visial Studio Code de terminale "-npm install ol" yazıp çalıştırın
5- Kodun arkayüz kısmının çalıştığından emin olun ve de ön yüz kısmını çalıştırın


### Gerekli Yazılımlar

- .NET 7 SDK
- MySQL Veritabanı
- HTML
- CSS
- Javascript
- Openlayers kütüphanesi


## Kullanım

- Projeyi çalıştırdıktan sonra Türkiye haritası sizi karşılayacaktır.
- Haritada herhangi bir yere dokunarak nokta ekleme işlemi gerçekleştirebiliriz.
- Nokta üzerinde değişiklik yapabilmek için edit point butonuna bir kere basıp noktayı sürükleyerek güncelleyebilirsiniz.
- Polygon eklemek için ekranın sağ aşağısındaki polygon butonuna basın. Kapalı bir alan oluşturana kadar nokta eklemeye devam edin. Alanın adını girdikten sonra kayıt işlemi gerçekleşecektir.
- Çizgi eklemek için ekranın sağ aşağısındaki Linestring butonuna basın. Eklemek istediğiniz çizgi noktalarını işaretleyin. İşaretleme işlemini bitirmek için son noktaya çift tıklayınız. 
Çizgi adını girdikten sonra kayıt işlemi gerçekleşecektir.
- Query Point kısmını tıklandıktan sonra veritabanında kayıtlı değerleri gösterir. Id, name, wkt değerleri ekranda gözükür. 
- Show butonuna bastıktan sonra nokta haritada zoom yaparak kullanıcıya yeri gösterilir.
- Edit işlemi ile noktanın bilgileri güncellenebilir.
- Calculate butonuna basıldığında çizgi değerinin uzunluğu ve polygon değerleri içinde alan hesaplanıp toaster olarak kullanıcıya gönderilir. Veritabanın bu bilgi kayıt edilmez !!!
- Delete butonu ile veritabanında noktanın bilgileri silinir.
- Harita üzerinde nokta, polygon ve ya çizgi değişkenlerinin üzerine tıklanarak çıkan pop up kısmında isim ve koordinat bilgisi alınabilir ve de silme ve güncelleme butonu ile nokta değişkeni yönetilebilir.

## Katkıda Bulunma

Katkıda bulunmak isterseniz, lütfen bir pull request oluşturun. Büyük değişiklikler için önce bir konu açarak neyi değiştirmek istediğinizi tartışın.

1. Projeyi Fork'layın.
2. Değişiklikleri yapın.
3. Bir pull request açın.



## Kaynakça ve Teşekkür

- ASP.NET Core resmi dokümantasyonu
- Geospatial World ve GeoDelta Labs'in harita yazılımı videoları
- Openlayers 
- Doğancan YELKARASI hocama sonsuz teşekkürler...
