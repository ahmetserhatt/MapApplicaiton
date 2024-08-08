using System.Collections.Generic;
using System.Linq;
using MapApplication.Interface;
using MapApplication.Models;

namespace MapApplication.Repositories
{
    public class PointRepository : IPointRepository
    {
        private readonly AppDbContext _appDbContext;

        public PointRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public IEnumerable<Point> GetAll()
        {
            return _appDbContext.points;
        }

        public Point GetById(int id)
        {
            return _appDbContext.points.FirstOrDefault(p => p.Id == id);
        }

        public void Add(Point point)
        {
            var lastPoint = _appDbContext.points.OrderByDescending(p => p.Id).FirstOrDefault();
            int newId = (lastPoint != null ? lastPoint.Id : 0) + 1;

            if (_appDbContext.points.Any(p => p.Id == newId))
            {
                throw new System.Exception("Aynı Id'ye sahip başka bir nesne mevcut.");
            }

            point.Id = newId;
            _appDbContext.points.Add(point);
            _appDbContext.SaveChanges();
        }

        public void Delete(int id)
        {
            var point = GetById(id);
            if (point != null)
            {
                _appDbContext.points.Remove(point);
                _appDbContext.SaveChanges();
            }
        }

        public void Update(int id, Point updatedPoint)
        {
            var point = GetById(id);
            if (point != null)
            {
                point.Wkt = updatedPoint.Wkt;
                point.Name = updatedPoint.Name;
                _appDbContext.SaveChanges();
            }
        }

        public bool Exists(int id)
        {
            return _appDbContext.points.Any(p => p.Id == id);
        }
    }
}
