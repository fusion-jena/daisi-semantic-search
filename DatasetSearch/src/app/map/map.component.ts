import {Component, AfterViewInit, Input, SimpleChanges, OnChanges} from '@angular/core';
import * as L from 'leaflet';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnChanges {
    private map;
    @Input() markers;
    private layerGroup;

    private initMap(): void {
        this.map = L.map('map', {
            center: [48.59378, 9.35982],
            zoom: 3
        });

        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 1,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        tiles.addTo(this.map);
    }

    constructor() {
    }

    ngAfterViewInit(): void {
        this.initMap();
    }

    ngOnChanges(changes: SimpleChanges): void {
        let lastMarker;
        if (this.layerGroup !== undefined) {
            this.map.removeLayer(this.layerGroup);
        }
        if (this.markers && this.markers?.items?.length !== 0) {
            const coordinates = [];
            this.markers.items.forEach(item => {
                if (item.getLatitude() !== undefined && item.getLongitude() !== undefined) {
                    const coordinate = [item.getLatitude(), item.getLongitude(), item.getColor()];
                    coordinates.push(coordinate);
                }
            });
            const layerGroup = L.layerGroup().addTo(this.map);
            coordinates.forEach((value, i) => {
                const circle = L.circle([coordinates[i][0], coordinates[i][1]], {
                    color: coordinates[i][2],
                    fillColor: coordinates[i][2],
                    fillOpacity: 0.5,
                    radius: 500
                });
                layerGroup.addLayer(circle);
                lastMarker = [coordinates[i][0], coordinates[i][1]];
            });
            if (lastMarker !== undefined) {
                this.map.panTo(new L.LatLng(lastMarker[0], lastMarker[1]));
            }
            this.layerGroup = layerGroup;
        }
    }
}
