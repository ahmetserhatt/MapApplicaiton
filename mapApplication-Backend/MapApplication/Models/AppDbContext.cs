using Microsoft.EntityFrameworkCore;

namespace MapApplication.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) { }
        public DbSet<Point> points { get; set; }

    }
}
