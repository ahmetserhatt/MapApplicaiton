using MapApplication.Interface;
using MapApplication.Models;
using MapApplication.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace MapApplication.Controllers
{
    [Route("api/point")]
    [ApiController]
    public class PointController : ControllerBase
    {
        private readonly IPointRepository _pointRepository;

        public PointController(IPointRepository pointRepository)
        {
            _pointRepository = pointRepository;
        }

        [HttpGet]
        public ActionResult<Response<IEnumerable<Point>>> GetAll()
        {
            try
            {
                var points = _pointRepository.GetAll();
                return Ok(new Response<IEnumerable<Point>> { Success = true, Data = points });
            }
            catch (System.Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response<IEnumerable<Point>> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<Response<Point>>> Add(Point point)
        {
            try
            {
                _pointRepository.Add(point);
                return Ok(new Response<Point> { Success = true, Data = point });
            }
            catch (System.Exception ex)
            {
                return Conflict(new Response<Point> { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Response<Point>> GetById(string id)
        {
            try
            {
                var veriable = int.Parse(id);
                if (veriable <= 0)
                {
                    return BadRequest(new Response<Point> { Success = false, Message = "Hatalı değer girdiniz" });
                }

                var point = _pointRepository.GetById(veriable);

                if (point == null)
                {
                    return NotFound(new Response<Point> { Success = false, Message = $"{id} id'li nokta bulunamadı" });
                }

                return Ok(new Response<Point> { Success = true, Data = point });
            }
            catch (System.Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response<Point> { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public ActionResult<Response<Point>> DeletePoint(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new Response<Point> { Success = false, Message = "Hatalı değer girdiniz" });
                }

                var point = _pointRepository.GetById(id);

                if (point == null)
                {
                    return NotFound(new Response<Point> { Success = false, Message = $"{id} id'li nokta bulunamadı" });
                }

                _pointRepository.Delete(id);
                return Ok(new Response<Point> { Success = true, Data = point });
            }
            catch (System.Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response<Point> { Success = false, Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<Response<Point>> Update(int id, Point updatedPoint)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new Response<Point> { Success = false, Message = "Hatalı değer girdiniz" });
                }

                var point = _pointRepository.GetById(id);

                if (point == null)
                {
                    return NotFound(new Response<Point> { Success = false, Message = $"{id} id'li nokta bulunamadı" });
                }

                _pointRepository.Update(id, updatedPoint);
                return Ok(new Response<Point> { Success = true, Data = updatedPoint });
            }
            catch (System.Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response<Point> { Success = false, Message = ex.Message });
            }
        }
    }
}