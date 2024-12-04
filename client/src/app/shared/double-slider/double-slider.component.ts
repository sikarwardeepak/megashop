import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-double-slider',
  templateUrl: './double-slider.component.html',
  styleUrls: ['./double-slider.component.css']
})
export class DoubleSliderComponent implements OnInit {
  @Input() min: number = 0;
  @Input() max: number = 1000;
  @Input() step: number = 50;
  @Input() range: number[] = [200, 800];

  @Output() rangeChange: EventEmitter<number[]> = new EventEmitter<number[]>();

  // Positions in percentage
  minPosition: number = 0;
  maxPosition: number = 100;

  draggingMin: boolean = false;
  draggingMax: boolean = false;

  ngOnInit() {
    this.updatePositions();
  }

  updatePositions() {
    this.minPosition = ((this.range[0] - this.min) / (this.max - this.min)) * 100;
    this.maxPosition = ((this.range[1] - this.min) / (this.max - this.min)) * 100;
  }

  onMouseDownMin(event: MouseEvent) {
    event.preventDefault();
    this.draggingMin = true;
  }

  onMouseDownMax(event: MouseEvent) {
    event.preventDefault();
    this.draggingMax = true;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.draggingMin) {
      this.handleDrag(event, 'min');
    }
    if (this.draggingMax) {
      this.handleDrag(event, 'max');
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.draggingMin = false;
    this.draggingMax = false;
  }

  handleDrag(event: MouseEvent, handle: 'min' | 'max') {
    const slider = (event.target as HTMLElement).closest('.slider-container') as HTMLElement;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    let percentage = ((event.clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    const value = Math.round(this.min + (percentage / 100) * (this.max - this.min) / this.step) * this.step;

    if (handle === 'min') {
      if (value <= this.range[1]) {
        this.range[0] = value;
        this.minPosition = percentage;
        this.rangeChange.emit(this.range);
      }
    } else {
      if (value >= this.range[0]) {
        this.range[1] = value;
        this.maxPosition = percentage;
        this.rangeChange.emit(this.range);
      }
    }
  }
}