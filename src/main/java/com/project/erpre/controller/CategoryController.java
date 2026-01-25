package com.project.erpre.controller;
import com.project.erpre.model.Category;
import com.project.erpre.model.CategoryDTO;
import com.project.erpre.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class); // Logger declaration

    @Autowired
    public CategoryService categoryService;


    // All category paths
    @GetMapping("/allPaths")
    public List<CategoryDTO> getAllCategoryPaths() {
        return categoryService.getAllCategoryPaths();
    }

    // 🔴 All categories
    @GetMapping("/all")
    public List<Category> getAllCategory() {
        return categoryService.getAllCategory();
    }

    // Specific category
    @GetMapping("/{categoryNo}")
    public Optional<Category> getCategoryById(@PathVariable Integer categoryNo) {
        return categoryService.getCategoryById(categoryNo);
    }

    // Save category
    @PostMapping("/save")
    public Category saveCategory(@RequestBody CategoryDTO categoryDTO) {
        // Entity is automatically bound via form data or query parameters,
        // but DTO requires @RequestBody to convert JSON body into an object.
        return categoryService.saveCategory(categoryDTO);
    }

    // Update category
    @PutMapping("/upd/{categoryNo}")
    public Category updateCategory(@PathVariable Integer categoryNo, @RequestBody CategoryDTO categoryDTO ) {
        categoryDTO.setCategoryNo(categoryNo);
        return categoryService.updateCategory(categoryNo, categoryDTO);
    }

    // Delete category
    @DeleteMapping("/del/{categoryNo}")
    public void deleteCategory(@PathVariable Integer categoryNo) {
        categoryService.deleteById(categoryNo);
    }

    // Top-level category
    @GetMapping("/top")
    public List<Category> getTopCategory() {
        return categoryService.getTopCategory();
    }

    // Middle-level category
    @GetMapping("/middle/{topCategoryId}")
    public List<Category> getMiddleCategory(@PathVariable Integer topCategoryId) {
        return categoryService.getMiddleCategory(topCategoryId);
    }

    // Low-level category
    @GetMapping("/low/{middleCategoryId}/{topCategoryId}")
    public List<Category> getLowCategory(@PathVariable Integer topCategoryId,
                                         @PathVariable Integer middleCategoryId) {
        return categoryService.getLowCategory(topCategoryId, middleCategoryId);
    }

}
