using Azure.Core;
using LuxHotel.Application.Dtos;
using LuxHotel.Domain.Entities;
using LuxHotel.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LuxHotel.Api.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly LuxHotelDbContext _context;
        public ArticlesController(LuxHotelDbContext context)
        {
            _context = context;
        }

        [HttpGet("/api/articles/getAll")]

        public async Task<ActionResult<List<Article>>> getAllArticles()
        {
            var articlesList = await _context.Articles.AsNoTracking().ToListAsync();
            return articlesList;
        }

        [HttpGet("/api/articles/getById/{id}")]

        public async Task<ActionResult<Article>> getArticleById(int id)
        {
            var article = await _context.Articles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);

            if (article == null)
            {
                return NotFound(new { message = "Article not found" });
            }

            return Ok(article);
        }

        [HttpGet("/api/articles/pagination")]
        public async Task<ActionResult<PagedResultDTO<Article>>> getArticlesPagination(
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            //  Tạo query gốc
            var query = _context.Articles.AsQueryable();

            //  Đếm tổng số lượng từ query gốc
            var totalItems = await query.CountAsync();

            //  Lấy dữ liệu phân trang, lúc này mới cần AsNoTracking()
            var articles = await query
                .AsNoTracking()
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResultDTO<Article>(articles, totalItems, pageNumber, pageSize));
        }
        // Filters
        [HttpGet("/api/articles/getByTitle/{title}")]

        public async Task<ActionResult<List<Article>>> getArticlesByTitle(string title)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                return BadRequest(new { message = "title is required" });
            }

            title = title.ToLower();

            var articles = await _context.Articles.AsNoTracking().Where(x => x.Title.ToLower().Contains(title)).ToListAsync();

            return Ok(articles);
        }

        [HttpGet("/api/articles/getByCategory/{category}")]

        public async Task<ActionResult<List<Article>>> getArticlesByCategoryName(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
            {
                return BadRequest(new { message = "category not found" });
            }

            if (category is not ("Daily" or "Blog" or "Event"))
            {
                return BadRequest(new { message = "Inavailable category name. Category must be: Daily, Blog, Event" });
            }

            var articles = await _context.Articles.AsNoTracking().Where(x => x.Category == category).ToListAsync();

            return Ok(articles);
        }


        // Filters


        [Authorize(Roles = "Admin")]
        [HttpPost("/api/articles")]
        public async Task<IActionResult> createNewArticle(ArticleCreateRequest request)
        {



            //  Lấy và kiểm tra ID từ Token một cách an toàn
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
            {
                return Unauthorized();
            }

            //  Tìm User trong DB
            User author = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

            //  Rào lỗi: Nếu không tìm thấy User trong DB thì báo lỗi 404 ngay
            if (author == null)
            {
                return NotFound("Author not found.");
            }



            
            var newArticle = new Article()
            {
                Title = request.Title,
                Author = author.FullName,
                Category = request.Category,
                Summary = request.Summary,
                Content = request.Content,
                PublishedAt = DateTime.UtcNow,
            };

            //  Lưu vào DB
            _context.Articles.Add(newArticle);
            await _context.SaveChangesAsync();

            return Created(string.Empty, new { message = "create successful" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("/api/articles/edit/{id}")]

        public async Task<ActionResult<Article>> editArticles(int id, [FromBody] ArticleEditRequest request)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(x => x.Id == id);
            if (article == null)
            {
                return NotFound(new { message = "Article not found" });
            }

            article.Title = request.Title;
            article.Category = request.Category;
            article.Summary = request.Summary;
            article.Content = request.Content;

            await _context.SaveChangesAsync();
            return Ok(article);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("/api/articles/delete/{id}")]

        public async Task<IActionResult> deleteArticleById(int id)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(x => x.Id == id);
            if (article == null)
            {
                return NotFound("Article not found");
            }

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Delete successfully" });
        }
    }
}
