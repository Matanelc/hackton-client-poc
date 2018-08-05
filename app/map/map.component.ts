import {Component, ViewChild, OnInit} from '@angular/core';
import * as app from "application";
import { registerElement } from 'nativescript-angular/element-registry';
import { MapView, Marker, Position } from 'nativescript-google-maps-sdk';
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { Fab } from "nativescript-floatingactionbutton";
import { LostPetsProviderService } from "../services/lost-pets-provider.service";
import { LostPet } from '~/models/lost-pet';
import { LostPetsReporterService } from '~/services/lost-pets-reporter.service';
import { PetType } from '~/models/pet-type';
import { SpatialLocation } from '~/models/spatial-location';
import { Guid } from "guid-typescript";

registerElement("Fab", () => Fab);
registerElement('MapView', () => MapView);
 
@Component({
    moduleId: module.id,
    selector: 'map',
    templateUrl: 'map.html',
    styleUrls: ['map.css'],
})
export class MapComponent {
    latitude =  32.0672359;
    longitude = 34.7947387;
    zoom = 18;
    minZoom = 0;
    maxZoom = 22;
    bearing = 0;
    tilt = 0;
    padding = [40, 40, 40, 40];
    mapView: MapView;
    lastCamera: String;

    constructor(private lostPetsProviderService: LostPetsProviderService,
                private lostPetsReporterService : LostPetsReporterService) {
    }

    async ngOnInit() {
    }

    onMapReady(event) {
        console.log('Map Ready, retrieving pets...');
        this.mapView = event.object;
    }

    reloadMarkers() {
        this.mapView.removeAllMarkers();
        this.lostPetsProviderService.getLostPetsInArea().subscribe(lostPet => this.petToMarker(lostPet));
    }

    petToMarker(pet : LostPet) {
        console.log("RECEIVED LOST PET! " + pet.name)
        var marker = new Marker();
        marker.position = Position.positionFromLatLng(pet.lastSeenLocation.latitude, pet.lastSeenLocation.longtitude);
        marker.title = pet.type + " " + pet.name;
        marker.snippet = pet.breed;
        marker.userData = {index: 1};

        this.mapView.addMarker(marker);
    }

    addNewPet(args) {
    }

    onCoordinateTapped(args) {
        console.log("Coordinate Tapped, Lat: " + args.position.latitude + ", Lon: " + args.position.longitude, args);

        console.log("ADDING")
        var lostPet = new LostPet();
        lostPet.type = PetType.dog;
        lostPet.name = "papi " + Guid.create();
        lostPet.lastSeenLocation = new SpatialLocation();
        lostPet.lastSeenLocation.latitude = args.position.latitude;
        lostPet.lastSeenLocation.longtitude  = args.position.longitude;

        this.lostPetsReporterService.report(lostPet);

        console.log('PET ADDED!!');
        this.reloadMarkers();
    }

    onMarkerEvent(args) {
        console.log("Marker Event: '" + args.eventName
            + "' triggered on: " + args.marker.title
            + ", Lat: " + args.marker.position.latitude + ", Lon: " + args.marker.position.longitude, args);
    }

    onCameraChanged(args) {
        console.log("Camera changed: " + JSON.stringify(args.camera), JSON.stringify(args.camera) === this.lastCamera);
        this.lastCamera = JSON.stringify(args.camera);
    
    }
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
 
}
