// ==============================
// LOCATION PICKER — GPS + Map
// ==============================

import { dispatch, getState, subscribe } from '../store.js';
import { $, showToast } from '../utils/helpers.js';
import * as api from '../api-client.js';

let map = null;
let marker = null;
let selectedLocation = { lat: null, lng: null, address: '' };

/** Open location modal */
export function openLocationModal() {
    $('#locationModal').classList.add('active');
    $('#locationOverlay').classList.add('active');
    document.body.classList.add('no-scroll');

    // Initialize map after modal is visible
    setTimeout(() => initMap(), 100);
}

/** Close location modal */
export function closeLocationModal() {
    $('#locationModal').classList.remove('active');
    $('#locationOverlay').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

/** Initialize Leaflet map */
function initMap() {
    const mapContainer = document.getElementById('locationMap');
    if (!mapContainer) return;

    // If map already exists, just invalidate size
    if (map) {
        map.invalidateSize();
        return;
    }

    // Default to Cairo, Egypt
    const defaultLat = 30.0444;
    const defaultLng = 31.2357;

    map = L.map('locationMap').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;background:var(--color-primary, #6c5ce7);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

    marker = L.marker([defaultLat, defaultLng], { draggable: true, icon: customIcon }).addTo(map);

    // On marker drag end, reverse geocode
    marker.on('dragend', async () => {
        const { lat, lng } = marker.getLatLng();
        await reverseGeocode(lat, lng);
    });

    // On map click, move marker there
    map.on('click', async (e) => {
        marker.setLatLng(e.latlng);
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
}

/** Use GPS to get current location */
async function useGPS() {
    const gpsBtn = $('#gpsBtn');
    if (!navigator.geolocation) {
        showToast('Geolocation not supported by your browser', 'error');
        return;
    }

    gpsBtn.classList.add('loading');
    gpsBtn.textContent = 'Locating...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;

            // Move map and marker
            if (map && marker) {
                map.setView([latitude, longitude], 16);
                marker.setLatLng([latitude, longitude]);
            }

            await reverseGeocode(latitude, longitude);

            gpsBtn.classList.remove('loading');
            gpsBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
        My Location
      `;
            showToast('Location detected!');
        },
        (error) => {
            gpsBtn.classList.remove('loading');
            gpsBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        My Location
      `;
            let msg = 'Unable to get location';
            if (error.code === 1) msg = 'Location access denied. Please enable it in your browser settings.';
            else if (error.code === 2) msg = 'Location unavailable';
            else if (error.code === 3) msg = 'Location request timed out';
            showToast(msg, 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

/** Reverse geocode lat/lng to address using Nominatim */
async function reverseGeocode(lat, lng) {
    selectedLocation.lat = lat;
    selectedLocation.lng = lng;

    updateAddressDisplay('Looking up address...', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();

        if (data.display_name) {
            selectedLocation.address = data.display_name;
            const parts = data.address || {};
            const shortAddress = [parts.road, parts.house_number].filter(Boolean).join(' ') || data.display_name.split(',')[0];
            const city = parts.city || parts.town || parts.village || '';
            const state = parts.state || '';

            updateAddressDisplay(
                shortAddress + (city ? `, ${city}` : '') + (state ? `, ${state}` : ''),
                `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            );
        }
    } catch {
        selectedLocation.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        updateAddressDisplay('Could not resolve address', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }

    // Enable confirm button
    const confirmBtn = $('#locationConfirmBtn');
    if (confirmBtn) confirmBtn.disabled = false;
}

/** Search for an address using Nominatim */
async function searchAddress(query) {
    if (!query || query.length < 3) return;

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const results = await res.json();

        if (results.length > 0) {
            const { lat, lon, display_name } = results[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);

            if (map && marker) {
                map.setView([latitude, longitude], 16);
                marker.setLatLng([latitude, longitude]);
            }

            selectedLocation = { lat: latitude, lng: longitude, address: display_name };
            updateAddressDisplay(display_name, `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

            const confirmBtn = $('#locationConfirmBtn');
            if (confirmBtn) confirmBtn.disabled = false;
        } else {
            showToast('Address not found. Try a different search.', 'error');
        }
    } catch {
        showToast('Search failed. Check your connection.', 'error');
    }
}

/** Update the address display area */
function updateAddressDisplay(text, coords) {
    const textEl = document.getElementById('locationAddressText');
    const coordsEl = document.getElementById('locationCoords');
    if (textEl) textEl.innerHTML = `<strong>Selected Location</strong>${text}`;
    if (coordsEl) coordsEl.textContent = coords;
}

/** Update header location chip */
function updateHeaderLocation() {
    const { location } = getState();
    const existingChip = document.querySelector('.header__location-btn');

    if (location && location.address) {
        const shortAddr = location.address.split(',').slice(0, 2).join(',');
        if (existingChip) {
            existingChip.querySelector('.header__location-text').textContent = shortAddr;
        }
    }
}

/** Confirm selected location */
async function confirmLocation() {
    if (!selectedLocation.lat || !selectedLocation.lng) return;

    const label = document.getElementById('locationLabel')?.value || 'Home';

    // Dispatch to store
    dispatch({
        type: 'SET_LOCATION',
        payload: { ...selectedLocation, label }
    });

    // Save to backend if logged in
    if (api.isLoggedIn()) {
        try {
            await api.saveLocation(selectedLocation.lat, selectedLocation.lng, selectedLocation.address, label, true);
        } catch { /* ignore save error */ }
    }

    closeLocationModal();
    showToast(`Location set: ${selectedLocation.address.split(',')[0]}`);
    updateHeaderLocation();
}

/** Initialize location picker */
export function initLocation() {
    // Close handlers
    $('#locationModalClose').addEventListener('click', closeLocationModal);
    $('#locationOverlay').addEventListener('click', closeLocationModal);

    // GPS button
    $('#gpsBtn').addEventListener('click', useGPS);

    // Search
    const searchInput = $('#locationSearchInput');
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchAddress(searchInput.value.trim());
        }
    });

    // Confirm
    $('#locationConfirmBtn').addEventListener('click', confirmLocation);

    // Header location button
    const locationHeaderBtn = document.querySelector('.header__location-btn');
    if (locationHeaderBtn) {
        locationHeaderBtn.addEventListener('click', openLocationModal);
    }

    // Subscribe
    subscribe(() => updateHeaderLocation());
}
