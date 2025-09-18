// Simple test script to verify search functionality
// Run with: node test-search.js

const testSearch = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ job: 'Software Engineer' }),
    });
    
    const data = await response.json();
    console.log('Search Results:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testSearch();
}

module.exports = { testSearch };
