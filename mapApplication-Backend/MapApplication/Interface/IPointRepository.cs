namespace MapApplication.Interface
{
    public interface IPointRepository
    {
        IEnumerable<Point> GetAll();
        Point GetById(int id);
        void Add(Point point);
        void Delete(int id);
        void Update(int id, Point updatedPoint);
        bool Exists(int id);
    }
}
