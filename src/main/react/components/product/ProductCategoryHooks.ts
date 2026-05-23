// src/main/react/components/product/ProductCategoryHooks.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export const useHooksList = () => {

  const [isLoading, setLoading] = useState(true); // Loading state

  const [category, setCategory] = useState([]);
  const [categoryName, setCategoryName] = useState('');

  const [categoryLevel, setCategoryLevel] = useState('Top Category'); // Category level (Top / Middle / Low)

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Fetch Top / Middle / Low categories
  const [getTopCategory, setGetTopCategory] = useState([]);
  const [getMidCategory, setGetMidCategory] = useState([]);
  const [getLowCategory, setGetLowCategory] = useState([]);

  // New category input values
  const [insertTop, setInsertTop] = useState('');   // Add top category
  const [insertMid, setInsertMid] = useState('');   // Add middle category
  const [insertLow, setInsertLow] = useState('');   // Add low category

  // Selected categories
  const [selectedTopCategory, setSelectedTopCategory] = useState(null);
  const [selectedMidCategory, setSelectedMidCategory] = useState(null);
  const [selectedLowCategory, setSelectedLowCategory] = useState(null);

  // Newly inserted category lists
  const [insertedTopList, setInsertedTopList] = useState([]);
  const [insertedMidList, setInsertedMidList] = useState([]);
  const [insertedLowList, setInsertedLowList] = useState([]);

  // Hovered category state
  const [hoverTop, setHoverTop] = useState(null);
  const [hoverMid, setHoverMid] = useState(null);
  const [hoverLow, setHoverLow] = useState(null);

  // All categories
  const [allCategories, setAllCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [midCategories, setMidCategories] = useState([]);
  const [lowCategories, setLowCategories] = useState([]);

  // Selected category object
  const [selectedCategory, setSelectedCategory] = useState([{
    top: '',
    middle: '',
    low: ''
  }]);

  // Fetch full category path list
  useEffect(() => {
    fetch('/api/category/allPaths')
        .then(response => response.json())
        .then(data => {
          setCategory(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to load category list.', error);
          setLoading(false);
        });
  }, []);

  // Fetch top categories
  useEffect(() => {
    fetch('/api/category/top')
        .then(response => response.json())
        .then(data => {
          const topCategory = Array.isArray(data) ? data : [data];
          setGetTopCategory(topCategory);
          if (topCategory.length > 0) {
            setSelectedTopCategory(topCategory[0].categoryNo);
          }
        })
        .catch(error => console.error('Failed to load top categories.', error));
  }, []);

  // Fetch middle categories
  useEffect(() => {
    if (selectedTopCategory) {
      setGetLowCategory([]);
      fetch(`/api/category/middle/${selectedTopCategory}`)
          .then(response => response.json())
          .then(data => {
            const midCategory = Array.isArray(data) ? data : [data];
            setGetMidCategory(midCategory);
            setSelectedMidCategory(null);
          })
          .catch(error => console.error('Failed to load middle categories.', error));
    } else {
      setGetLowCategory([]);
    }
  }, [selectedTopCategory]);

  // Fetch low categories
  useEffect(() => {
    if (selectedTopCategory && selectedMidCategory) {
      fetch(`api/category/low/${selectedMidCategory}/${selectedTopCategory}`)
          .then(response => response.json())
          .then(data => {
            const lowCategory = Array.isArray(data) ? data : [data];
            setGetLowCategory(lowCategory);
            setSelectedLowCategory(null);
          })
          .catch(error => console.error('Failed to load low categories.', error));
    } else {
      setGetLowCategory([]);
    }
  }, [selectedTopCategory, selectedMidCategory]);

  // Fetch all categories
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await axios.get('/api/category/all');
        const categories = response.data;
        console.log('All category data:', categories);

        setAllCategories(categories);

        const top = categories.filter(cat => !cat.parentCategoryNo);
        setTopCategories(top);
        console.log('Top categories:', top);

        const mid = categories.filter(cat =>
            cat.parentCategoryNo && top.some(t => t.categoryNo === cat.parentCategoryNo)
        );
        setMidCategories(mid);
        console.log('Middle categories:', mid);

        const low = categories.filter(cat => {
          const middle = mid.find(m => m.categoryNo === cat.parentCategoryNo);
          return middle && top.some(t => t.categoryNo === middle.parentCategoryNo);
        });
        setLowCategories(low);
        console.log('Low categories:', low);

      } catch (error) {
        console.error('Failed to fetch all categories:', error);
      }
    };

    fetchAllCategories();
  }, []);

  // 🟡 Filter middle categories when top category changes
  useEffect(() => {
    console.log('Selected top category:', selectedCategory.top);
    if (selectedCategory.top) {
      const filteredMiddle = allCategories.filter(cat => cat.parentCategoryNo === selectedCategory.top);
      console.log('Filtered middle categories:', filteredMiddle);
      setMidCategories(filteredMiddle);
    } else {
      setMidCategories([]);
    }
    setLowCategories([]);
  }, [selectedCategory.top, allCategories]);

  // 🟡 Filter low categories when middle category changes
  useEffect(() => {
    if (selectedCategory.middle) {
      const filteredLow = allCategories.filter(cat => cat.parentCategoryNo === selectedCategory.middle);
      console.log('Filtered low categories:', filteredLow);
      setLowCategories(filteredLow);
    } else {
      setLowCategories([]);
    }
  }, [selectedCategory.middle, allCategories]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Category edit function
  const handleEditButton = () => {
    if (selectedCategory.top || selectedCategory.middle || selectedCategory.low) {
      let selectedCate = null;

      if (selectedCategory.low) {
        selectedCate = lowCategories.find(c => c.categoryNo === selectedCategory.low);
      } else if (selectedCategory.middle) {
        selectedCate = midCategories.find(c => c.categoryNo === selectedCategory.middle);
      } else if (selectedCategory.top) {
        selectedCate = topCategories.find(c => c.categoryNo === selectedCategory.top);
      }

      if (!selectedCate) {
        window.showToast('Please select a category to edit.', 'error');
        return;
      }

      const updateCategoryName = prompt(
          'Enter a new category name',
          selectedCate.categoryNm
      );

      if (!updateCategoryName || updateCategoryName.trim() === '') {
        window.showToast('Edit canceled.');
        return;
      }

      fetch(`/api/category/upd/${selectedCate.categoryNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryNm: updateCategoryName.trim(),
          categoryLevel: selectedCate.categoryLevel,
          categoryDeleteYn: selectedCate.categoryDeleteYn,
          parentCategoryNo: selectedCate.parentCategoryNo
        }),
      })
          .then(response => {
            if (!response.ok) {
              return response.json().then(error => {
                throw new Error(error.message);
              });
            }

            window.showToast('Category updated successfully.');

            const updateList = (list, setter) => {
              setter(list.map(c =>
                  c.categoryNo === selectedCate.categoryNo
                      ? { ...c, categoryNm: updateCategoryName }
                      : c
              ));
            };

            setAllCategories(prev =>
                prev.map(c =>
                    c.categoryNo === selectedCate.categoryNo
                        ? { ...c, categoryNm: updateCategoryName }
                        : c
                )
            );

            if (selectedCate.categoryLevel === 1) {
              updateList(topCategories, setTopCategories);
              setLowCategories([]);
            } else if (selectedCate.categoryLevel === 2) {
              updateList(midCategories, setMidCategories);
            } else {
              updateList(lowCategories, setLowCategories);
            }
          })
          .catch(error => {
            console.error('Category update failed:', error);
            window.showToast('An error occurred while updating the category.', 'error');
          });
    } else {
      window.showToast('Please select a category to edit.', 'error');
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Category delete function
  const handleDeleteButton = () => {
    if (selectedCategory.top || selectedCategory.middle || selectedCategory.low) {
      let selectedCate = null;

      if (selectedCategory.low) {
        selectedCate = lowCategories.find(c => c.categoryNo === selectedCategory.low);
      } else if (selectedCategory.middle) {
        selectedCate = midCategories.find(c => c.categoryNo === selectedCategory.middle);
      } else if (selectedCategory.top) {
        selectedCate = topCategories.find(c => c.categoryNo === selectedCategory.top);
      }

      window.confirmCustom(`Delete category "${selectedCate.categoryNm}"?`)
          .then(result => {
            if (result) {
              fetch(`/api/category/del/${selectedCate.categoryNo}`, { method: 'DELETE' })
                  .then(response => {
                    if (response.ok) {
                      window.showToast('Category deleted.');

                      setAllCategories(prev =>
                          prev.filter(c => c.categoryNo !== selectedCate.categoryNo)
                      );

                      if (selectedCate.categoryLevel === 1) {
                        setTopCategories(prev => prev.filter(c => c.categoryNo !== selectedCate.categoryNo));
                        setMidCategories([]);
                        setLowCategories([]);
                      } else if (selectedCate.categoryLevel === 2) {
                        setMidCategories(prev => prev.filter(c => c.categoryNo !== selectedCate.categoryNo));
                        setLowCategories([]);
                      } else {
                        setLowCategories(prev => prev.filter(c => c.categoryNo !== selectedCate.categoryNo));
                      }
                    }
                  })
                  .catch(error => console.error('Category deletion failed:', error));
            }
          });
    } else {
      window.showToast('Please select a category to delete.', 'error');
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////

  return {
    category,
    categoryName,
    selectedCategory,
    categoryLevel,
    showModal,
    getTopCategory,
    getMidCategory,
    getLowCategory,
    insertTop,
    insertMid,
    insertLow,
    selectedTopCategory,
    selectedMidCategory,
    selectedLowCategory,
    hoverTop,
    hoverMid,
    hoverLow,
    isSubmitting,
    allCategories,
    topCategories,
    midCategories,
    lowCategories,
    handleEditButton,
    handleDeleteButton,
    openModal: () => setShowModal(true),
    closeModal: () => setShowModal(false),
    setSelectedCategory,
    isLoading,
  };
};
