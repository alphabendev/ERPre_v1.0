// src/main/react/components/common/CategoryAddModal.js
import React, { useState, useEffect } from 'react';

function CategoryModal({
                         category,
                         getTopCategory,
                         getMidCategory,
                         getLowCategory,
                         selectedTopCategory,
                         selectedMidCategory,
                         selectedLowCategory,
                         insertTop,
                         insertMid,
                         insertLow,
                         handleInsert,
                         handleAddButton,
                         handleEditButton,
                         handleDeleteButton,
                         handleTopClick,
                         handleMidClick,
                         handleLowClick,
                         handleTopHover,
                         closeModal,
                         handleBackgroundClick,
                         isSubmitting,
                         setAllCategories,
                         setTopCategories,
                         setMidCategories,
                         setLowCategories,
                         allCategories,
                         topCategories,
                         midCategories,
                         lowCategories,
                         setSelectedCategory,
                         selectedCategory,
                       }) {

  return (
      <div className="modal_overlay" onMouseDown={handleBackgroundClick}>
        <div className="modal_container cate_modal">
          <div className="header">
            <div>Edit Product Categories</div>
            <button className="btn_close" onClick={closeModal}>
              <i className="bi bi-x-lg"></i>
            </button> {/* Modal close button */}
          </div>
          <div className='edit_wrap'>
            {/* Top Level Category */}
            <div className='level_wrap'>
              <h4>Top Level
                {topCategories.length > 0 && (
                    <span className="list_cnt">({topCategories.length})</span>
                )}
              </h4>
              <div className='content_wrap'>
                <div className='list_wrap'>
                  <ul className='list'>
                    {topCategories.map((category) => (
                        <li key={category.categoryNo}
                            onClick={() => {
                              handleTopClick(category.categoryNo);
                              handleTopHover(category.categoryNo);
                            }}
                            className={selectedCategory.top === category.categoryNo ? 'selected' : ''}
                        >
                          <span className='category-span'>{category.categoryNm}</span>
                          <i className="bi bi-chevron-right"></i>
                        </li>
                    ))}
                  </ul>
                </div>
                <div className='input-wrap'>
                  <div className={`search_box ${insertTop ? 'has_text' : ''}`}>
                    <label className="label_floating">Press Enter to add Top Level</label>
                    <i className="bi bi-plus-lg"></i>
                    <input
                        type="text"
                        className="box search"
                        onChange={(e) => handleInsert(e, 1)}
                        value={insertTop}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isSubmitting) {
                            handleAddButton(1);
                          }
                        }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Level Category */}
            <div className='level_wrap'>
              <h4>Middle Level
                {midCategories.length > 0 && (
                    <span className="list_cnt">({midCategories.length})</span>
                )}
              </h4>
              <div className='content_wrap'>
                <div className='list_wrap' style={{ position: 'relative' }}>
                  {midCategories.length === 0 ? (
                      <p className='empty_wrap'><i className="bi bi-exclamation-circle"></i>Please select a Top Level category.</p>
                  ) : (
                      <ul className='list'>
                        {midCategories.map((category) => (
                            <li key={category.categoryNo}
                                onClick={() => handleMidClick(category.categoryNo)}
                                className={selectedCategory.middle === category.categoryNo ? 'selected' : ''}
                            >
                              <span className='category-span'>{category.categoryNm}</span>
                              <i className="bi bi-chevron-right"></i>
                            </li>
                        ))}
                      </ul>
                  )}
                </div>
                <div className='input-wrap'>
                  <div className={`search_box ${insertMid ? 'has_text' : ''}`}>
                    <label className="label_floating">Press Enter to add Middle Level</label>
                    <i className="bi bi-plus-lg"></i>
                    <input
                        type="text"
                        className="box search"
                        onChange={(e) => handleInsert(e, 2)}
                        value={insertMid}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isSubmitting) {
                            handleAddButton(2);
                          }
                        }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Low Level Category */}
            <div className='level_wrap'>
              <h4>Low Level
                {lowCategories.length > 0 && (
                    <span className="list_cnt">({lowCategories.length})</span>
                )}
              </h4>
              <div className='content_wrap'>
                <div className='list_wrap' style={{ position: 'relative' }}>
                  {!selectedCategory.middle ? (
                      <p className='empty_wrap'><i className="bi bi-exclamation-circle"></i>Please select a Middle Level category.</p>
                  ) : lowCategories.length === 0 ? (
                      <p className='empty_wrap'><i className="bi bi-exclamation-circle"></i>No data available.</p>
                  ) : (
                      <ul className='list'>
                        {lowCategories.map((category) => (
                            <li key={category.categoryNo}
                                onClick={() => handleLowClick(category.categoryNo)}
                                className={selectedCategory.low === category.categoryNo ? 'selected' : ''}
                            >
                              <span className='category-span'>{category.categoryNm}</span>
                            </li>
                        ))}
                      </ul>
                  )}
                </div>

                {/* Low Level input only renders if Middle Level is selected */}
                {selectedCategory.middle && (
                    <div className='input-wrap'>
                      <div className={`search_box ${insertLow ? 'has_text' : ''}`}>
                        <label className="label_floating">Press Enter to add Low Level</label>
                        <i className="bi bi-plus-lg"></i>
                        <input
                            type="text"
                            className="box search"
                            onChange={(e) => handleInsert(e, 3)}
                            value={insertLow}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !isSubmitting) {
                                handleAddButton(3);
                              }
                            }}
                        />
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className='btn_wrap'>
            <div className='selected-cate'>
              <label className='floating-label'>Selected Category</label>
              {selectedCategory.low ? (
                  <span className='input-field'>
                {lowCategories.find(category => category.categoryNo === selectedCategory.low)?.categoryNm || 'No category selected'}
              </span>
              ) : selectedCategory.middle ? (
                  <span className='input-field'>
                {midCategories.find(category => category.categoryNo === selectedCategory.middle)?.categoryNm || 'No category selected'}
              </span>
              ) : selectedCategory.top ? (
                  <span className='input-field'>
                {topCategories.find(category => category.categoryNo === selectedCategory.top)?.categoryNm || 'No category selected'}
              </span>
              ) : (
                  <span>No category selected</span>
              )}
            </div>
            <button type='submit' className='box color_border edit' onClick={handleEditButton}>Edit</button>
            <button type='submit' className='box color_border del red' onClick={handleDeleteButton}>Delete</button>
          </div>
        </div>
      </div>
  );
}

export default CategoryModal;
