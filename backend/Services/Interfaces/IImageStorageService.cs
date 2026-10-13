using Microsoft.AspNetCore.Http;

namespace ItIsAll.Api.Services.Interfaces;

public interface IImageStorageService
{
    Task<string> SaveImageAsync(IFormFile file, string subFolder = "products");
    Task<List<string>> SaveImagesAsync(IEnumerable<IFormFile> files, string subFolder = "products");
    Task<bool> DeleteImageAsync(string imageUrl);
}
