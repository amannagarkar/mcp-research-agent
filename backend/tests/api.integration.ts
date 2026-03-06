import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const MCP_URL = 'http://localhost:3001/api';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

// Helper function to log results
function logResult(name: string, status: 'PASS' | 'FAIL', message: string, data?: any) {
  results.push({ name, status, message, data });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
  if (data && status === 'FAIL') {
    console.log(`   Details:`, data);
  }
}

// Test suite
async function runTests() {
  console.log('\n========================================');
  console.log('🧪 COMPREHENSIVE API TESTS');
  console.log('========================================\n');

  // Backend Tests
  console.log('📋 BACKEND API TESTS\n');

  // Test 1: Health Check
  try {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
    logResult('Health Check', 'PASS', 'Backend is running', response.data);
  } catch (error: any) {
    logResult('Health Check', 'FAIL', error.message);
  }

  // Test 2: Get All Papers
  let allPapers: any[] = [];
  try {
    const response = await axios.get(`${API_URL}/papers`);
    allPapers = response.data || [];
    logResult('Get All Papers', 'PASS', `Retrieved ${allPapers.length} papers`, { count: allPapers.length });
  } catch (error: any) {
    logResult('Get All Papers', 'FAIL', error.message);
  }

  // Test 3: Get All Papers with Pagination
  try {
    const response = await axios.get(`${API_URL}/papers?limit=5&offset=0`);
    const papers = response.data || [];
    logResult('Get Papers with Pagination', 'PASS', `Retrieved ${papers.length} papers with limit=5`, { count: papers.length });
  } catch (error: any) {
    logResult('Get Papers with Pagination', 'FAIL', error.message);
  }

  // Test 4: Search Papers (if any exist)
  if (allPapers.length > 0) {
    try {
      const searchQuery = allPapers[0].title.substring(0, 5);
      const response = await axios.post(`${API_URL}/papers/search`, {
        query: searchQuery,
        limit: 10,
      });
      const searchResults = response.data || [];
      logResult('Search Papers', 'PASS', `Found ${searchResults.length} papers matching query`, { query: searchQuery, count: searchResults.length });
    } catch (error: any) {
      logResult('Search Papers', 'FAIL', error.message);
    }

    // Test 5: Get Specific Paper
    try {
      const paperId = allPapers[0].id;
      const response = await axios.get(`${API_URL}/papers/${paperId}`);
      const paper = response.data;
      
      if (paper.id === paperId) {
        logResult('Get Specific Paper', 'PASS', `Retrieved paper: ${paper.title}`, paper);
      } else {
        logResult('Get Specific Paper', 'FAIL', 'Paper ID mismatch');
      }
    } catch (error: any) {
      logResult('Get Specific Paper', 'FAIL', error.message);
    }

    // Test 6: Get Similar Papers
    try {
      const paperId = allPapers[0].id;
      const response = await axios.get(`${API_URL}/papers/${paperId}/similar?limit=5`);
      const similarPapers = response.data || [];
      logResult('Get Similar Papers', 'PASS', `Found ${similarPapers.length} similar papers`, { count: similarPapers.length });
    } catch (error: any) {
      logResult('Get Similar Papers', 'FAIL', error.message);
    }

    // Test 7: Paper Data Integrity
    try {
      const paper = allPapers[0];
      const hasRequiredFields = paper.id && paper.title && paper.created_at;
      const hasOptionalFields = paper.abstract || paper.authors || paper.tags;
      
      if (hasRequiredFields) {
        logResult('Paper Data Integrity', 'PASS', 'All required fields present', {
          requiredFields: { id: !!paper.id, title: !!paper.title, created_at: !!paper.created_at },
          optionalFields: { abstract: !!paper.abstract, authors: !!paper.authors, tags: !!paper.tags }
        });
      } else {
        logResult('Paper Data Integrity', 'FAIL', 'Missing required fields');
      }
    } catch (error: any) {
      logResult('Paper Data Integrity', 'FAIL', error.message);
    }

    // Test 8: Authors Format Check
    try {
      const paper = allPapers[0];
      if (paper.authors && paper.authors.length > 0) {
        const firstAuthor = paper.authors[0];
        const isString = typeof firstAuthor === 'string';
        const hasNameFields = firstAuthor.name || (firstAuthor.first_name && firstAuthor.last_name);
        
        if (isString || hasNameFields) {
          logResult('Authors Format', 'PASS', `Authors properly formatted as ${isString ? 'strings' : 'objects'}`, { firstAuthor });
        } else {
          logResult('Authors Format', 'FAIL', 'Authors format incorrect');
        }
      } else {
        logResult('Authors Format', 'PASS', 'No authors to check (optional field)');
      }
    } catch (error: any) {
      logResult('Authors Format', 'FAIL', error.message);
    }

    // Test 9: Tags Format Check
    try {
      const paper = allPapers[0];
      if (paper.tags && paper.tags.length > 0) {
        const firstTag = paper.tags[0];
        const isString = typeof firstTag === 'string';
        const hasNameField = firstTag.name;
        
        if (isString || hasNameField) {
          logResult('Tags Format', 'PASS', `Tags properly formatted as ${isString ? 'strings' : 'objects'}`, { firstTag });
        } else {
          logResult('Tags Format', 'FAIL', 'Tags format incorrect');
        }
      } else {
        logResult('Tags Format', 'PASS', 'No tags to check (optional field)');
      }
    } catch (error: any) {
      logResult('Tags Format', 'FAIL', error.message);
    }
  } else {
    console.log('⚠️  No papers in database - skipping paper-specific tests');
  }

  // MCP Server Tests
  console.log('\n📋 MCP SERVER API TESTS\n');

  // Test 10: MCP Health Check
  try {
    const response = await axios.get(`${MCP_URL.replace('/api', '')}/health`);
    logResult('MCP Health Check', 'PASS', 'MCP Server is running', response.data);
  } catch (error: any) {
    logResult('MCP Health Check', 'FAIL', error.message);
  }

  // Test 11: Parse Paper with Mock Data
  try {
    const response = await axios.post(`${MCP_URL}/parse-paper`, {
      filePath: '/nonexistent/file.pdf',
      fileName: 'test.pdf',
    });
    const parsed = response.data;
    
    const hasRequiredFields = parsed.title && parsed.abstract && parsed.authors && parsed.tags;
    if (hasRequiredFields) {
      logResult('Parse Paper (Mock)', 'PASS', `Parsed paper: ${parsed.title}`, {
        title: parsed.title,
        authorsCount: parsed.authors.length,
        tagsCount: parsed.tags.length,
        pages: parsed.pages,
      });
    } else {
      logResult('Parse Paper (Mock)', 'FAIL', 'Missing required fields in parsed data');
    }
  } catch (error: any) {
    logResult('Parse Paper (Mock)', 'FAIL', error.message);
  }

  // Test 12: Find Similar Papers
  try {
    const response = await axios.post(`${MCP_URL}/find-similar`, {
      title: 'Machine Learning',
      abstract: 'A paper about ML techniques',
      tags: ['machine learning', 'deep learning'],
      existingPapers: [],
    });
    const result = response.data;
    
    if (result.similar_papers !== undefined) {
      logResult('Find Similar Papers', 'PASS', `Similar papers endpoint working`, {
        similarPapersCount: result.similar_papers.length,
        query: result.query,
      });
    } else {
      logResult('Find Similar Papers', 'FAIL', 'Invalid response format');
    }
  } catch (error: any) {
    logResult('Find Similar Papers', 'FAIL', error.message);
  }

  // Test 13: Analyze Paper
  try {
    const fullText = `
      Machine Learning Advances
      
      This paper presents new approaches to machine learning.
      - We introduce novel algorithms
      - We demonstrate state-of-the-art results
      - We provide comprehensive analysis
      
      Keywords: machine learning, neural networks, deep learning
    `;
    
    const response = await axios.post(`${MCP_URL}/analyze-paper`, {
      fullText: fullText,
      title: 'Test Paper',
    });
    const analysis = response.data;
    
    const hasAnalysis = analysis.key_points && analysis.summary && analysis.topics;
    if (hasAnalysis) {
      logResult('Analyze Paper', 'PASS', 'Paper analysis successful', {
        keyPointsCount: analysis.key_points.length,
        summaryLength: analysis.summary.length,
        topicsCount: analysis.topics.length,
      });
    } else {
      logResult('Analyze Paper', 'FAIL', 'Missing analysis fields');
    }
  } catch (error: any) {
    logResult('Analyze Paper', 'FAIL', error.message);
  }

  // Edge Cases Tests
  console.log('\n🔍 EDGE CASE TESTS\n');

  // Test 14: Search with Empty Query
  try {
    const response = await axios.post(`${API_URL}/papers/search`, {
      query: '',
      limit: 10,
    });
    logResult('Search Empty Query', 'PASS', 'Handled empty query', { count: response.data.length });
  } catch (error: any) {
    logResult('Search Empty Query', 'FAIL', error.message);
  }

  // Test 15: Get Non-existent Paper
  try {
    await axios.get(`${API_URL}/papers/nonexistent-id-12345`);
    logResult('Get Non-existent Paper', 'FAIL', 'Should return 404');
  } catch (error: any) {
    if (error.response?.status === 404) {
      logResult('Get Non-existent Paper', 'PASS', 'Correctly returned 404', error.response.data);
    } else {
      logResult('Get Non-existent Paper', 'FAIL', `Expected 404, got ${error.response?.status}`);
    }
  }

  // Test 16: Pagination Edge Case - Offset > Total
  try {
    const response = await axios.get(`${API_URL}/papers?limit=5&offset=9999`);
    logResult('Pagination Edge Case', 'PASS', 'Handled large offset', { count: response.data.length });
  } catch (error: any) {
    logResult('Pagination Edge Case', 'FAIL', error.message);
  }

  // Test 17: Analyze Paper with Empty Text
  try {
    await axios.post(`${MCP_URL}/analyze-paper`, {
      fullText: '',
      title: 'Empty Paper',
    });
    logResult('Analyze Empty Paper', 'FAIL', 'Should reject empty fullText');
  } catch (error: any) {
    if (error.response?.status === 400) {
      logResult('Analyze Empty Paper', 'PASS', 'Correctly rejected empty text', error.response.data);
    } else {
      logResult('Analyze Empty Paper', 'FAIL', error.message);
    }
  }

  // Test 18: Analyze Paper Missing Title
  try {
    await axios.post(`${MCP_URL}/analyze-paper`, {
      fullText: 'Some content here',
      title: '',
    });
    logResult('Analyze Missing Title', 'FAIL', 'Should reject missing title');
  } catch (error: any) {
    if (error.response?.status === 400) {
      logResult('Analyze Missing Title', 'PASS', 'Correctly rejected missing title', error.response.data);
    } else {
      logResult('Analyze Missing Title', 'FAIL', error.message);
    }
  }

  // Test 19: Large Pagination Limit
  try {
    const response = await axios.get(`${API_URL}/papers?limit=1000&offset=0`);
    logResult('Large Pagination Limit', 'PASS', `Handled large limit, returned ${response.data.length} papers`);
  } catch (error: any) {
    logResult('Large Pagination Limit', 'FAIL', error.message);
  }

  // Test 20: Response Time Check
  try {
    const start = Date.now();
    await axios.get(`${API_URL}/papers?limit=10`);
    const duration = Date.now() - start;
    
    if (duration < 1000) {
      logResult('Response Time', 'PASS', `Response completed in ${duration}ms`, { duration });
    } else {
      logResult('Response Time', 'FAIL', `Slow response: ${duration}ms`);
    }
  } catch (error: any) {
    logResult('Response Time', 'FAIL', error.message);
  }

  // Print Summary
  console.log('\n========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  // Print detailed results
  console.log('📝 DETAILED RESULTS:\n');
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.data && result.status === 'PASS') {
      console.log(`   Data: ${JSON.stringify(result.data, null, 2).split('\n').join('\n   ')}`);
    }
    console.log();
  });

  console.log('========================================\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
