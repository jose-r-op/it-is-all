using ItIsAll.Api.DTOs.Products;
using ItIsAll.Api.Models.Enums;

namespace ItIsAll.Api.Services.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(
        ProductOrigin? origin = null,
        int? categoryId = null,
        string? search = null,
        bool? isFeatured = null,
        int page = 1,
        int pageSize = 50);

    Task<ProductDto> GetByIdAsync(int id);
    Task<ProductDto> GetBySlugAsync(string slug);
    Task<ProductDto> CreateAsync(CreateProductDto dto);
    Task<ProductDto> UpdateAsync(int id, UpdateProductDto dto);
    Task<bool> DeleteAsync(int id);

    Task<List<CategoryDto>> GetCategoriesAsync();
    Task<CategoryDto> CreateCategoryAsync(string name, string? description);
}
