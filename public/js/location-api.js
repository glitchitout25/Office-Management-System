/**
 * Location API Integration for Employee Forms
 * Uses CountriesNow API to dynamically populate country, state, and city dropdowns
 */

class LocationAPI {
  constructor() {
    this.baseURL = 'https://countriesnow.space/api/v0.1';
    this.init();
  }

  init() {
    // Initialize on form pages
    if (document.getElementById('country')) {
      this.setupLocationDropdowns();
    }
  }

  async setupLocationDropdowns() {
    const countrySelect = document.getElementById('country');
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');

    if (!countrySelect) return;

    try {
      // Load countries on page load
      await this.loadCountries();

      // Set up event handlers
      countrySelect.addEventListener('change', async (e) => {
        const selectedCountry = e.target.value;
        if (selectedCountry) {
          await this.loadStates(selectedCountry);
        } else {
          this.clearDropdown(stateSelect, 'Select State');
          this.clearDropdown(citySelect, 'Select City');
        }
      });

      stateSelect?.addEventListener('change', async (e) => {
        const selectedState = e.target.value;
        const selectedCountry = countrySelect.value;
        if (selectedState && selectedCountry) {
          await this.loadCities(selectedCountry, selectedState);
        } else {
          this.clearDropdown(citySelect, 'Select City');
        }
      });

      // If editing existing employee, load states and cities
      if (countrySelect.value) {
        await this.loadStates(countrySelect.value);
        if (stateSelect?.value) {
          await this.loadCities(countrySelect.value, stateSelect.value);
        }
      }

    } catch (error) {
      console.error('Failed to initialize location dropdowns:', error);
      this.showError('Failed to load location data. Please refresh the page.');
    }
  }

  async loadCountries() {
    try {
      this.showLoading('country');
      
      const response = await fetch(`${this.baseURL}/countries`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Countries API response:', data); // Debug log

      if (data.error) {
        throw new Error(data.msg || 'API returned error');
      }

      const countrySelect = document.getElementById('country');
      const currentValue = countrySelect.value;
      
      // Clear dropdown
      countrySelect.innerHTML = '<option value="">Select Country...</option>';
      countrySelect.disabled = false;

      // Handle different response formats
      const countries = data.data || data;
      if (!Array.isArray(countries)) {
        throw new Error('Invalid countries data format');
      }

      countries.forEach(country => {
        const option = document.createElement('option');
        const countryName = country.country || country.name || country;
        option.value = countryName;
        option.textContent = countryName;
        if (option.value === currentValue) {
          option.selected = true;
        }
        countrySelect.appendChild(option);
      });

      this.hideLoading('country');
      console.log(`Loaded ${countries.length} countries`); // Debug log
    } catch (error) {
      console.error('Error loading countries:', error);
      this.hideLoading('country');
      this.loadFallbackCountries(); // Load fallback data
    }
  }

  async loadStates(country) {
    try {
      this.showLoading('state');
      
      const response = await fetch(`${this.baseURL}/countries/states`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.msg);
      }

      const stateSelect = document.getElementById('state');
      const citySelect = document.getElementById('city');
      const currentValue = stateSelect?.value;
      
      if (stateSelect) {
        this.clearDropdown(stateSelect, 'Select State');
        this.clearDropdown(citySelect, 'Select City');

        data.data.states.forEach(state => {
          const option = document.createElement('option');
          option.value = state.name;
          option.textContent = state.name;
          if (option.value === currentValue) {
            option.selected = true;
          }
          stateSelect.appendChild(option);
        });

        stateSelect.disabled = false;
      }

      this.hideLoading('state');
    } catch (error) {
      console.error('Error loading states:', error);
      this.hideLoading('state');
      this.loadFallbackStates(country);
    }
  }

  async loadCities(country, state) {
    try {
      this.showLoading('city');
      
      const response = await fetch(`${this.baseURL}/countries/state/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country, state })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.msg);
      }

      const citySelect = document.getElementById('city');
      const currentValue = citySelect?.value;
      
      if (citySelect) {
        this.clearDropdown(citySelect, 'Select City');

        data.data.forEach(city => {
          const option = document.createElement('option');
          option.value = city;
          option.textContent = city;
          if (option.value === currentValue) {
            option.selected = true;
          }
          citySelect.appendChild(option);
        });

        citySelect.disabled = false;
      }

      this.hideLoading('city');
    } catch (error) {
      console.error('Error loading cities:', error);
      this.hideLoading('city');
      
      // Enable city dropdown for manual entry
      const citySelect = document.getElementById('city');
      if (citySelect) {
        citySelect.innerHTML = '<option value="">Enter city manually</option>';
        citySelect.disabled = false;
      }
    }
  }

  clearDropdown(selectElement, placeholder) {
    if (!selectElement) return;
    
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    selectElement.disabled = true;
  }

  showLoading(fieldName) {
    const select = document.getElementById(fieldName);
    if (select) {
      select.style.opacity = '0.6';
      select.disabled = true;
      
      // Add loading text to first option
      const firstOption = select.querySelector('option');
      if (firstOption) {
        firstOption.textContent = 'Loading...';
      }
    }
  }

  hideLoading(fieldName) {
    const select = document.getElementById(fieldName);
    if (select) {
      select.style.opacity = '1';
    }
  }

  loadFallbackStates(country) {
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    if (!stateSelect) return;

    console.log(`Loading fallback states for ${country}...`);
    
    const fallbackStates = {
      'United States': ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'],
      'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick'],
      'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory'],
      'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
      'Germany': ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Lower Saxony', 'Hesse', 'Saxony', 'Rhineland-Palatinate'],
      'India': ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'West Bengal']
    };

    const states = fallbackStates[country];
    
    if (states) {
      stateSelect.innerHTML = '<option value="">Select State...</option>';
      
      states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
      });
      
      stateSelect.disabled = false;
      this.clearDropdown(citySelect, 'Select City');
    } else {
      // For countries without predefined states, make it a text input
      stateSelect.innerHTML = '<option value="">Enter state/province manually</option>';
      stateSelect.disabled = false;
    }
  }

  loadFallbackCountries() {
    const countrySelect = document.getElementById('country');
    if (!countrySelect) return;

    console.log('Loading fallback countries...');
    
    const fallbackCountries = [
      'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
      'Australia', 'Japan', 'South Korea', 'China', 'India', 'Brazil', 'Mexico',
      'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria',
      'Belgium', 'Portugal', 'Ireland', 'Finland', 'New Zealand', 'Singapore'
    ];

    countrySelect.innerHTML = '<option value="">Select Country...</option>';
    
    fallbackCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
    
    countrySelect.disabled = false;
    this.showError('Using basic country list. Full location features may be limited.');
  }

  showError(message) {
    // Create or update error message element
    let errorElement = document.getElementById('location-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'location-error';
      errorElement.className = 'text-sm text-orange-600 mt-1 p-2 bg-orange-50 rounded';
      
      const countrySelect = document.getElementById('country');
      if (countrySelect && countrySelect.parentElement) {
        countrySelect.parentElement.appendChild(errorElement);
      }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide error after 8 seconds
    setTimeout(() => {
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }, 8000);
  }
}

// Initialize when DOM is loaded (but only once)
if (typeof window.LocationAPIInitialized === 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.LocationAPIInitialized = true;
    new LocationAPI();
  });
}
