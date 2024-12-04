import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../../services/category.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-management',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  newCategory: Category = { id: 0, name: '' };
  view: string = 'view';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
    });
  }

  setView(view: string): void {
    this.view = view;
    if (view === 'create') {
      this.newCategory = { id: 0, name: '' };
    }
  }

  saveCategory(): void {
    this.categoryService.createCategory(this.newCategory).subscribe(() => {
      this.loadCategories();
      this.setView('view');
    });
  }

  updateCategory(category: Category): void {
    this.categoryService.updateCategory(category.id, category).subscribe(() => {
      this.loadCategories();
    });
  }

  deleteCategory(category: Category): void {
    this.categoryService.deleteCategory(category.id).subscribe(() => {
      this.loadCategories();
    });
  }

  cancel(): void {
    this.setView('view');
  }
}