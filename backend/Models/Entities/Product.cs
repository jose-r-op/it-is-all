using ItIsAll.Api.Models.Enums;

namespace ItIsAll.Api.Models.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int Stock { get; set; } = 1;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public ProductOrigin Origin { get; set; } = ProductOrigin.ItIsAll;
    public ProductCondition Condition { get; set; } = ProductCondition.NewWithTags;
    public string Brand { get; set; } = "It Is All";

    public string Sizes { get; set; } = string.Empty; // Ej: "S, M, L" o "Talla Única"
    public string Color { get; set; } = string.Empty;
    public bool IsFeatured { get; set; } = false;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

    // Helper OOP methods
    public string? CoverImageUrl => Images.OrderByDescending(i => i.IsCover).ThenBy(i => i.DisplayOrder).FirstOrDefault()?.ImageUrl;

    public void AddImage(string imageUrl, bool isCover = false)
    {
        if (isCover)
        {
            foreach (var img in Images)
            {
                img.IsCover = false;
            }
        }
        else if (!Images.Any())
        {
            isCover = true;
        }

        Images.Add(new ProductImage
        {
            ImageUrl = imageUrl,
            IsCover = isCover,
            DisplayOrder = Images.Count
        });
    }
}
