// src/globals.d.ts
/// <reference types="google.maps" />

declare namespace google.maps.marker {
    interface AdvancedMarkerElementOptions {
      position: google.maps.LatLng | google.maps.LatLngLiteral;
      map: google.maps.Map;
      draggable?: boolean;
      title?: string;
      content?: HTMLElement | string;
      label?: string | AdvancedMarkerLabel;
      // Add other properties as needed
    }
  
    interface AdvancedMarkerLabel {
      text: string;
      color?: string;
      fontSize?: string;
      fontWeight?: string;
      // Add other label properties as needed
    }
  
    class AdvancedMarkerElement extends google.maps.OverlayView {
      constructor(options: AdvancedMarkerElementOptions);
      position: google.maps.LatLng;
      draggable: boolean;
      title: string;
      content: HTMLElement | string;
      label?: string | AdvancedMarkerLabel;
  
      addListener(eventName: 'dragend', handler: (event: google.maps.event.MouseEvent) => void): void;
      // Add other methods and properties as needed
    }
  }