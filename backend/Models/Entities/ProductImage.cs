namespace ItIsAll.Api.Models.Entities;

public class ProductImage : BaseEntity
{
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
    public bool IsCover { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
}
