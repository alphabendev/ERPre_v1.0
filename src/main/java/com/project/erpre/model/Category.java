package com.project.erpre.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "m_category")
@Data
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_no")
    private Integer categoryNo;

    @Column(name = "category_level", nullable = false)
    private Integer categoryLevel = 1; // Default value

    @Column(name = "parent_category_no")
    private Integer parentCategoryNo;

    @Column(name = "category_nm", length = 100, nullable = false)
    private String categoryNm;

    @Column(name = "category_insert_date", nullable = false, insertable = false)
    // insertable = false: JPA ignores this field when inserting the entity,
    // and the database automatically sets the value. Example: automatically insert current time with CURRENT_TIMESTAMP.
    private Timestamp categoryInsertDate;

    @Column(name = "category_update_date")
    private Timestamp categoryUpdateDate;

    @Column(name = "category_delete_yn", length = 20, nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'N'")
    private String categoryDeleteYn = "N"; // Default value 'N' indicates not deleted

    @Column(name = "category_delete_date")
    private Timestamp categoryDeleteDate; // Deletion timestamp

    @ToString.Exclude
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @JsonIgnore
    // @JsonBackReference
    private List<Product> products;

    // Field referencing the parent category
    @ManyToOne
    @JoinColumn(name = "parent_category_no", insertable = false, updatable = false) // Foreign key setting
    @JsonBackReference // Prevent circular reference
    private Category parentCategory;

    // Field referencing child categories
    @OneToMany(mappedBy = "parentCategory")
    @JsonIgnore
    private List<Category> subCategories;

    public String getCategoryPath() {
        StringBuilder path = new StringBuilder(this.categoryNm);
        Category parent = this.parentCategory;

        while (parent != null) {
            path.insert(0, parent.getCategoryNm() + " > "); // Add parent category in front
            parent = parent.getParentCategory();
        }

        return path.toString();
    }
}
