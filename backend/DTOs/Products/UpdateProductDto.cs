using ItIsAll.Api.Models.Enums;
using Microsoft.AspNetCore.Http;

namespace ItIsAll.Api.DTOs.Products;

public class UpdateProductDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int? Stock { get; set; }
    public int? CategoryId { get; set; }
    public ProductOrigin? Origin { get; set; }
    public ProductCondition? Condition { get; set; }
    public string? Brand { get; set; }
    public string? Sizes { get; set; }
    public string? Color { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsActive { get; set; }

    public List<string>? ExistingImageUrlsToKeep { get; set; }
    public List<IFormFile>? NewFiles { get; set; }
}
