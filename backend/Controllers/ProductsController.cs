using ItIsAll.Api.DTOs.Products;
using ItIsAll.Api.Models.Enums;
using ItIsAll.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ItIsAll.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IImageStorageService _imageService;

    public ProductsController(
        IProductService productService,
        IImageStorageService imageService)
    {
        _productService = productService;
        _imageService = imageService;
    }

    /// <summary>
    /// Catálogo general de productos con soporte para filtros
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] ProductOrigin? origin,
        [FromQuery] int? categoryId,
        [FromQuery] string? search,
        [FromQuery] bool? isFeatured,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var products = await _productService.GetAllAsync(origin, categoryId, search, isFeatured, page, pageSize);
        return Ok(products);
    }

    /// <summary>
    /// Obtener detalle de un producto por ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var product = await _productService.GetByIdAsync(id);
            return Ok(product);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtener detalle de un producto por su Slug (URL amigable)
    /// </summary>
    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        try
        {
            var product = await _productService.GetBySlugAsync(slug);
            return Ok(product);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Crear un nuevo producto (con soporte para subida de fotos). Solo Administradores.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data", "application/json")]
    public async Task<IActionResult> Create([FromForm] CreateProductDto dto)
    {
        try
        {
            var created = await _productService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Actualizar un producto existente. Solo Administradores.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data", "application/json")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateProductDto dto)
    {
        try
        {
            var updated = await _productService.UpdateAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Eliminar un producto. Solo Administradores.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _productService.DeleteAsync(id);
        if (!result)
        {
            return NotFound(new { message = "Producto no encontrado" });
        }

        return NoContent();
    }

    /// <summary>
    /// Subir imágenes directas (para el modal o pop-up de carga)
    /// </summary>
    [HttpPost("upload-images")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files)
    {
        if (files == null || !files.Any())
        {
            return BadRequest(new { message = "No se adjuntaron imágenes" });
        }

        var savedUrls = await _imageService.SaveImagesAsync(files, "products");
        return Ok(new { urls = savedUrls });
    }
}
