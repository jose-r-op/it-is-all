using ItIsAll.Api.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace ItIsAll.Api.Services.Implementations;

public class ImageStorageService : IImageStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ImageStorageService> _logger;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".avif" };

    public ImageStorageService(IWebHostEnvironment environment, ILogger<ImageStorageService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<string> SaveImageAsync(IFormFile file, string subFolder = "products")
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("El archivo es inválido o está vacío");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException($"Formato no permitido: {extension}. Use JPG, PNG, WEBP o AVIF.");
        }

        // Crear carpeta si no existe
        var uploadsRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"), "uploads", subFolder);
        if (!Directory.Exists(uploadsRoot))
        {
            Directory.CreateDirectory(uploadsRoot);
        }

        // Nombre de archivo único
        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(uploadsRoot, uniqueFileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        _logger.LogInformation("Imagen guardada exitosamente: {FileName}", uniqueFileName);
        return $"/uploads/{subFolder}/{uniqueFileName}";
    }

    public async Task<List<string>> SaveImagesAsync(IEnumerable<IFormFile> files, string subFolder = "products")
    {
        var urls = new List<string>();
        foreach (var file in files)
        {
            try
            {
                var url = await SaveImageAsync(file, subFolder);
                urls.Add(url);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al guardar imagen: {FileName}", file.FileName);
            }
        }
        return urls;
    }

    public Task<bool> DeleteImageAsync(string imageUrl)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(imageUrl) || !imageUrl.StartsWith("/uploads/"))
            {
                return Task.FromResult(false);
            }

            var relativePath = imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var rootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var fullPath = Path.Combine(rootPath, relativePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Task.FromResult(true);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar imagen {Url}", imageUrl);
        }

        return Task.FromResult(false);
    }
}
