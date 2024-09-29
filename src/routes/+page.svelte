<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
</svelte:head>

<script>
  import { onMount } from 'svelte';

  let mapElement;
  let map;
  let latitude = '20.5937';   
  let longitude = '78.9629';
  let address = '';
  let suggestions = [];
  let selectedCrop = '';

  const cropTypes = [
    'Rice',
    'Wheat',
    'Maize',
    'Sugarcane',
    'Cotton',
    'Tea',
    'Coffee',
    'Jute',
    'Pulses',
    'Oilseeds'
  ];

  onMount(() => {
    initializeMap();
  });

  function initializeMap() {
    map = L.map(mapElement).setView([parseFloat(latitude), parseFloat(longitude)], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors' 
    }).addTo(map);

    // Add India outline
    fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india-states.geojson')
      .then(response => response.json())
      .then(data => { 
        L.geoJSON(data, {
          style: {
            color: '#3388ff',
            weight: 2,
            fillColor: '#f7f7f7',
            fillOpacity: 0.2
          }
        }).addTo(map);
      });
  }

  function handleCoordinateSubmit() {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lon) && map) {
      map.setView([lat, lon], 10);
    }
  }

  function getCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        latitude = position.coords.latitude.toFixed(4);
        longitude = position.coords.longitude.toFixed(4);
        handleCoordinateSubmit();
      }, () => {
        alert("Unable to retrieve your location");
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  }

  async function handleAddressSubmit() {
    if (!address) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in`);
      const data = await response.json();
      if (data.length > 0) {
        latitude = data[0].lat;
        longitude = data[0].lon;
        handleCoordinateSubmit();
      } else {
        alert("Address not found");
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      alert("Geocoding failed. Please try again.");
    }
  }

  async function getSuggestions() {
    if (address.length <= 2) {
      suggestions = [];
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in`);
      const data = await response.json();
      suggestions = data.map(item => item.display_name);
    } catch (error) {
      console.error("Suggestion failed", error);
      suggestions = [];
    }
  }

  function selectSuggestion(suggestion) {
    address = suggestion;
    suggestions = [];
    handleAddressSubmit();
  }

  $: {
    if (selectedCrop) {
      console.log(`Selected crop: ${selectedCrop}`);
      // Here you can add more functionality related to the selected crop
    }
  }
</script>

<style>
  :global(body, html) {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  .app-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    overflow: hidden;
  }
  .map-container {
    flex: 1;
    height: 100%;
  }
  .control-panel {
    width: 300px;
    background-color: #2d3748;
    padding: 1rem;
    overflow-y: auto;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  }
  .input-group {
    margin-bottom: 1rem;
  }
  .input-label {
    display: block;
    color: #e2e8f0;
    margin-bottom: 0.5rem;
  }
  .input-field {
    width: 100%;
    background-color: #4a5568;
    color: #e2e8f0;
    padding: 0.5rem;
    border: none;
    border-radius: 0.25rem;
  }
  .button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 0.25rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .button-blue {
    background-color: #4299e1;
    color: white;
  }
  .button-blue:hover {
    background-color: #3182ce;
  }
  .button-green {
    background-color: #48bb78;
    color: white;
  }
  .button-green:hover {
    background-color: #38a169;
  }
  .suggestions {
    position: absolute;
    background-color: #4a5568;
    border: 1px solid #2d3748;
    max-height: 150px;
    overflow-y: auto;
    width: calc(100% - 2rem);
    z-index: 1000;
  }
  .suggestion-item {
    padding: 8px;
    cursor: pointer;
    color: #e2e8f0;
  }
  .suggestion-item:hover {
    background-color: #2d3748;
  }
  .crop-select {
    width: 100%;
    background-color: #4a5568;
    color: #e2e8f0;
    padding: 0.5rem;
    border: none;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
</style>

<div class="app-container">
  <div bind:this={mapElement} class="map-container"></div>
  <div class="control-panel">
    <h2 class="text-2xl font-bold text-gray-100 mb-4">India Map Navigation</h2>
    
    <div class="input-group">
      <label for="latitude" class="input-label">Latitude</label>
      <input type="text" id="latitude" bind:value={latitude} class="input-field" placeholder="e.g. 28.6139" />
    </div>
    
    <div class="input-group">
      <label for="longitude" class="input-label">Longitude</label>
      <input type="text" id="longitude" bind:value={longitude} class="input-field" placeholder="e.g. 77.2090" />
    </div>
    
    <button on:click={handleCoordinateSubmit} class="button button-blue mb-2">
      Go to Coordinates
    </button>
    
    <button on:click={getCurrentLocation} class="button button-green mb-4">
      Use Current Location
    </button>
    
    <div class="input-group">
      <label for="address" class="input-label">Address</label>
      <input type="text" id="address" bind:value={address} on:input={getSuggestions} on:change={handleAddressSubmit} class="input-field" placeholder="Enter an address in India" />
      {#if suggestions.length > 0}
        <div class="suggestions">
          {#each suggestions as suggestion}
            <div class="suggestion-item" on:click={() => selectSuggestion(suggestion)}>
              {suggestion}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="input-group">
      <label for="crop-select" class="input-label">Select Crop Type</label>
      <select id="crop-select" bind:value={selectedCrop} class="crop-select">
        <option value="">Select a crop</option>
        {#each cropTypes as crop}
          <option value={crop}>{crop}</option>
        {/each}
      </select>
    </div>
  </div>
</div>