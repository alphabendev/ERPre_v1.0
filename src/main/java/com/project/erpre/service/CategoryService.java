package com.project.erpre.service;

import com.project.erpre.controller.CategoryController;
import com.project.erpre.model.Category;
import com.project.erpre.model.CategoryDTO;
import com.project.erpre.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class); // Logger declaration

    @Autowired
    private CategoryRepository categoryRepository;

    // Method to convert DTO to Entity
    private Category convertToEntity(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setCategoryLevel(categoryDTO.getCategoryLevel());
        category.setCategoryNm(categoryDTO.getCategoryNm());
        category.setParentCategoryNo(categoryDTO.getParentCategoryNo());

        return category;
    }

    // Method to convert Entity to DTO
    private CategoryDTO convertToDTO(Category category) {
        return CategoryDTO.builder()
                .categoryLevel(category.getCategoryLevel())
                .categoryNm(category.getCategoryNm())
                .parentCategoryNo(category.getParentCategoryNo())
                .build();
    }

    // All categories
    public List<CategoryDTO> getAllCategoryPaths() {
        List<Object[]> result = categoryRepository.findCategoryPathsAsObjects();
        return result.stream().map(obj -> new CategoryDTO(
                (Integer) obj[0], // one
                (Integer) obj[1], // two
                (Integer) obj[2], // three
                (Integer) obj[3], // category_no
                (Integer) obj[4], // level
                (String) obj[5],  // category_path
                (Timestamp) obj[6], // category_insert_date
                (Timestamp) obj[7] // category_update_date
        )).collect(Collectors.toList());
    }

    // Specific category
    public Optional<Category> getCategoryById(Integer categoryNo) {
        return categoryRepository.findById(categoryNo);
    }

    // Save category
    public Category saveCategory(CategoryDTO categoryDTO) {
        List<Category> existingCategory = categoryRepository.findByCategoryNmAndCategoryDeleteYn(categoryDTO.getCategoryNm(), "N");
        if (!existingCategory.isEmpty()) {
            throw new IllegalArgumentException('"' + categoryDTO.getCategoryNm() + '"' + " category already exists.");
        }
        logger.info("★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★");
        // DTO -> Entity conversion
        Category category = new Category();
        category.setCategoryLevel(categoryDTO.getCategoryLevel());
        category.setCategoryNm(categoryDTO.getCategoryNm());
        category.setParentCategoryNo(categoryDTO.getParentCategoryNo());
        category.setCategoryDeleteYn("N");

        logger.info("[CUSTOM_LOG] categoryDTO.getCategoryLevel() : " + categoryDTO.getCategoryLevel());
        logger.info("[CUSTOM_LOG] categoryDTO.getCategoryNm() : " + categoryDTO.getCategoryNm());
        logger.info("[CUSTOM_LOG] categoryDTO.getParentCategoryNo() : " + categoryDTO.getParentCategoryNo());
        logger.info("★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★");

        // // Set insert date (only when inserting new)
        // category.setCategoryInsertDate(new Timestamp(System.currentTimeMillis()));

        // Save entity
        return categoryRepository.save(category);
    }

    // Update category
    public Category updateCategory(Integer categoryNo, CategoryDTO categoryDTO) {
        logger.info("★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★");
        logger.info("[CUSTOM_LOG] CategoryService > updateCategory");

        Optional<Category> existingCategoryOptional = categoryRepository.findById(categoryNo); // Retrieve existing category entity for update
        if (!existingCategoryOptional.isPresent()) {
            throw new IllegalArgumentException("The specified category does not exist."); // Indicates that the retrieved category does not exist
        }

        // existingCategoryOptional is an Optional object, allows null
        // existingCategory is the actual object extracted above

        // DTO -> Entity conversion
        Category existingCategory = existingCategoryOptional.get();
        existingCategory.setCategoryLevel(categoryDTO.getCategoryLevel());
        existingCategory.setCategoryNm(categoryDTO.getCategoryNm());
        existingCategory.setParentCategoryNo(categoryDTO.getParentCategoryNo());
        logger.info("[CUSTOM_LOG] categoryDTO.getCategoryLevel() : " + categoryDTO.getCategoryLevel());
        logger.info("[CUSTOM_LOG] categoryDTO.getCategoryNm() : " + categoryDTO.getCategoryNm());
        logger.info("[CUSTOM_LOG] categoryDTO.getParentCategoryNo() : " + categoryDTO.getParentCategoryNo());
        logger.info("★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★");

        existingCategory.setCategoryUpdateDate(new Timestamp(System.currentTimeMillis()));

        return categoryRepository.save(existingCategory);
    }

    // Delete category
    public void deleteById(Integer categoryNo) {
        Category category = categoryRepository.findById(categoryNo).orElse(null);
        if (category != null) {
            category.setCategoryDeleteYn("Y");
            category.setCategoryDeleteDate(new Timestamp(System.currentTimeMillis()));
            deleteSubCategories(category);
            categoryRepository.save(category);
        }
    }

    private void deleteSubCategories(Category parentCategory) {
        // Retrieve middle-level (1st-level child) categories
        List<Category> subCategories = categoryRepository.findByParentCategoryNo(parentCategory.getCategoryNo());

        for (Category subCategory : subCategories) {
            // Mark middle-level category as deleted
            subCategory.setCategoryDeleteYn("Y");
            subCategory.setCategoryDeleteDate(new Timestamp(System.currentTimeMillis()));
            categoryRepository.save(subCategory);

            // If there are subcategories, recursively delete them
            deleteSubCategories(subCategory); // Recursively handle lower-level categories
        }
    }

    // 🔴All classifications
    public List<Category> getAllCategory() {
        return categoryRepository.findAllCategory();
    }

    public List<Category> getTopCategory() {
        return categoryRepository.findTopCategory();
    }

    public List<Category> getMiddleCategory(Integer topCategoryId) {
        return categoryRepository.findMiddleCategory(topCategoryId);
    }

    public List<Category> getLowCategory(Integer topCategoryId, Integer middleCategoryId) {
        return categoryRepository.findLowCategoryByTopAndMiddleCategory(topCategoryId, middleCategoryId);
    }

}
