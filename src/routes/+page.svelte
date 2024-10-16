<script>

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Chart from 'chart.js/auto';
  
	let mapElement;
	let map;
	let latitude = '20.5937';
	let longitude = '78.9629';
	let address = '';
	let suggestions = [];
	let selectedCrop = '';
	let showModal = false;
	let analysisResult = '';
	let showPanel = false;
	let IrrigationData = [];
	let chart;
	let chartCanvas;
  
	const cropTypes = [
		'Arecanut',
		'Arhar/Tur',
		'Bajra',
		'Banana',
		'Barley',
		'Black pepper',
		'Cardamom',
		'Cashewnut',
		'Castor seed',
		'Coconut ',
		'Coriander',
		'Cotton(lint)',
		'Cowpea(Lobia)',
		'Dry chillies',
		'Garlic',
		'Ginger',
		'Gram',
		'Groundnut',
		'Guar seed',
		'Horse-gram',
		'Jowar',
		'Jute',
		'Khesari',
		'Linseed',
		'Maize',
		'Masoor',
		'Mesta',
		'Moong(Green Gram)',
		'Moth',
		'Niger seed',
		'Oilseeds total',
		'Onion',
		'Other  Rabi pulses',
		'Other Cereals',
		'Other Kharif pulses',
		'Other Summer Pulses',
		'Peas & beans (Pulses)',
		'Potato',
		'Ragi',
		'Rapeseed &Mustard',
		'Rice',
		'Safflower',
		'Sannhamp',
		'Sesamum',
		'Small millets',
		'Soyabean',
		'Sugarcane',
		'Sunflower',
		'Sweet potato',
		'Tapioca',
		'Tobacco',
		'Turmeric',
		'Urad',
		'Wheat',
		'other oilseeds'
]

  
	onMount(() => {
	  if (browser) {
		import('leaflet').then((L) => {
		  initializeMap(L);
		});
	  }
	});

  
	function initializeMap(L) {
	  map = L.map(mapElement, { zoomControl: false }).setView([parseFloat(latitude), parseFloat(longitude)], 5);
  
	  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors'
	  }).addTo(map);
  
	  fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india-states.geojson')
		.then(response => response.json())
		.then(data => {
		  L.geoJSON(data, {
			style: {
			  color: '#6366f1',
			  weight: 2,
			  fillColor: '#818cf8',
			  fillOpacity: 0.1
			}
		  }).addTo(map);
		});
  
	  L.control.zoom({
		position: 'bottomright'
	  }).addTo(map);
	}
  
	function handleCoordinateSubmit() {
	  const lat = parseFloat(latitude);
	  const lon = parseFloat(longitude);
	  if (!isNaN(lat) && !isNaN(lon) && map) {
		map.setView([lat, lon], 10);
	  }
	}
  
	function getCurrentLocation() {
	  if (browser && "geolocation" in navigator) {
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
  
	function analyze() {
	  analysisResult = `Analysis for ${selectedCrop} at coordinates (${latitude}, ${longitude}):
	  Note: This is simulated data for demonstration purposes.`;
	  
	  // Generate mock data for the graph
	  IrrigationData = [
		{ month: 'Jan', yield: Math.random() * 2 + 1 },
		{ month: 'Feb', yield: Math.random() * 2 + 1 },
		{ month: 'Mar', yield: Math.random() * 2 + 1 },
		{ month: 'Apr', yield: Math.random() * 2 + 1 },
		{ month: 'May', yield: Math.random() * 2 + 2 },
		{ month: 'Jun', yield: Math.random() * 2 + 2 },
		{ month: 'Jul', yield: Math.random() * 2 + 3 },
		{ month: 'Aug', yield: Math.random() * 2 + 3 },
		{ month: 'Sep', yield: Math.random() * 2 + 3 },
		{ month: 'Oct', yield: Math.random() * 2 + 2 },
		{ month: 'Nov', yield: Math.random() * 2 + 2 },
		{ month: 'Dec', yield: Math.random() * 2 + 1 },
	  ];
	  
	  showModal = true;
	  
	  // Use setTimeout to ensure the canvas is in the DOM before creating the chart
	  setTimeout(() => {
		createChart();
	  }, 0);
	}
  
	function closeModal() {
	  showModal = false;
	  if (chart) {
		chart.destroy();
	  }
	}
  
	function createChart() {
	  if (chart) {
		chart.destroy();
	  }
	  
	  const ctx = chartCanvas.getContext('2d');
	  chart = new Chart(ctx, {
		type: 'line',
		data: {
		  labels: IrrigationData.map(data => data.month),
		  datasets: [{
			label: 'Irrigation',
			data: IrrigationData.map(data => data.yield),
			borderColor: 'rgb(75, 192, 192)',
			tension: 0.1
		  }]
		},
		options: {
		  responsive: true,
		  scales: {
			y: {
			  beginAtZero: true
			}
		  }
		}
	  });
	}
</script>

  <svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
	<div bind:this={mapElement} class="map-container"></div>
	<button class="toggle-panel-button" on:click={() => showPanel = !showPanel}>
		{showPanel ? '▼' : '▲'}
	</button>
	<div class="control-panel" class:show={showPanel}>
		<h2 class="panel-title">CropChronicle</h2>
		
		<div class="input-group">
			<input type="text" id="latitude" bind:value={latitude} class="input-field" placeholder="Latitude" />
			<input type="text" id="longitude" bind:value={longitude} class="input-field" placeholder="Longitude" />
			<button on:click={handleCoordinateSubmit} class="button">
				Go
			</button>
		</div>
		
		<div class="input-group">
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
			<select id="crop-select" bind:value={selectedCrop} class="input-field">
				<option value="">Select a crop</option>
				{#each cropTypes as crop}
					<option value={crop}>{crop}</option>
				{/each}
			</select>
			<button on:click={analyze} class="button" disabled={!selectedCrop}>
				Analyze
			</button>
		</div>
	</div>
</div>

{#if showModal}
	<div class="modal-backdrop" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<button class="modal-close" on:click={closeModal}>×</button>
			<h2 class="modal-title">Analysis Result</h2>
			<p class="modal-text">{analysisResult}</p>
			<div class="graph-container">
				<h3>Irrigation pattern by Month</h3>
				<canvas bind:this={chartCanvas}></canvas>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;	
		height: 100%;
		width: 100%;
		overflow: hidden;
		font-family: 'Inter', sans-serif;
		background-color: #f3f4f6;
	}
	.app-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.map-container {
		flex: 1;
		height: 100%;
	}
	.toggle-panel-button {
		position: absolute;
		bottom: 80px;
		left: 50%;
		transform: translateX(-50%);
		background-color: #4f46e5;
		color: white;
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		font-size: 20px;
		cursor: pointer;
		z-index: 1000;
		transition: background-color 0.3s;
	}
	.toggle-panel-button:hover {
		background-color: #4338ca;
	}
	.control-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		padding: 1rem;
		box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease-in-out;
		transform: translateY(100%);
		z-index: 1000;
	}
	.control-panel.show {
		transform: translateY(0);
	}
	.panel-title {
		color: #111827;
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}
	.input-group {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	.input-field {
		flex: 1;
		background-color: #f9fafb;
		color: #111827;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		font-size: 0.9rem;
	}
	.input-field::placeholder {
		color: #9ca3af;
	}
	.button {
		background-color: #4f46e5;
		color: white;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		font-weight: 500;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.2s;
	}
	.button:hover {
		background-color: #4338ca;
	}
	.button:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
	.suggestions {
		position: absolute;
		background-color: white;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		max-height: 200px;
		overflow-y: auto;
		width: calc(100% - 2rem);
		z-index: 1001;
	}
	.suggestion-item {
		padding: 0.5rem;
		cursor: pointer;
	}
	.suggestion-item:hover {
		background-color: #f3f4f6;
	}
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1002;
	}
	.modal-content {
		background-color: white;
		padding: 2rem;
		border-radius: 0.5rem;
		max-width: 500px;
		width: 90%;
		position: relative;
	}
	.modal-close {
		position: absolute;
		top: 0.5rem;
		right: 1rem;
		font-size: 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
	}
	.modal-title {
		margin-top: 0;
		color: #111827;
	}
	.modal-text {
		color: #4b5563;
		white-space: pre-line;
	}
	.graph-container {
		margin-top: 1rem;
		width: 100%;
		height: 300px;
	}
	.modal-content {
		max-width: 600px; /* Increased to accommodate the graph */
		width: 90%;
	}			
</style>	