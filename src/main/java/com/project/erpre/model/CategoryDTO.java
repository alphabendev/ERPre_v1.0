package com.project.erpre.model;

import lombok.*;

import javax.persistence.Column;
import java.sql.Timestamp;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryDTO {
    private Integer categoryNo;
    private Integer categoryLevel;
    private Integer parentCategoryNo;
    private String categoryNm;
    private Timestamp categoryInsertDate;
    private Timestamp categoryUpdateDate;
    private String categoryDeleteYn; // Default value 'N' indicates deletion status
    private Timestamp categoryDeleteDate; // Deletion timestamp

    private Integer one; // Top-level category number
    private Integer two; // Mid-level category number
    private Integer three; // Low-level category number
    private String paths; // Full category path

    // Additional fields
    private Integer topCategoryNo;
    private Integer middleCategoryNo;
    private Integer lowCategoryNo;
    private Integer categoryLv;

    public CategoryDTO(Integer one, Integer two, Integer three, Integer categoryNo, Integer categoryLevel, String paths, Timestamp categoryInsertDate, Timestamp categoryUpdateDate) {
        this.one = one;
        this.two = two;
        this.three = three;
        this.categoryNo = categoryNo;
        this.categoryLevel = categoryLevel;
        this.paths = paths;
        this.categoryInsertDate = categoryInsertDate;
        this.categoryUpdateDate = categoryUpdateDate;
    }

    // Constructor for category lookup
    public CategoryDTO(Integer topCategoryNo, Integer middleCategoryNo, Integer lowCategoryNo) {
        this.topCategoryNo = topCategoryNo;
        this.middleCategoryNo = middleCategoryNo;
        this.lowCategoryNo = lowCategoryNo;
    }
}
