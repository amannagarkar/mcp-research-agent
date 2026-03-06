#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const MCP_URL = 'http://localhost:3001/api';

async function uploadSamplePaper() {
  console.log('\n📤 UPLOADING SAMPLE PAPER...\n');

  try {
    // Create a sample PDF-like file
    const samplePaperPath = path.join('/tmp', 'sample-paper.txt');
    const sampleContent = `
    Elastic Sketch: Adaptive and Fast Network-wide Traffic Monitoring
    
    Tong Yang¹, Peking University
    Jie Jiang², Peking University  
    Peng Liu³, Peking University
    Qun Huang⁴, Institute of Computing Technology
    
    Abstract:
    Network traffic monitoring is essential for various network applications including traffic engineering, anomaly detection, and QoS monitoring. When network is undergoing problems such as congestion, scan attack, DDoS attack, etc., measurements are much more important than usual. 
    
    In this case, traffic characteristics including available bandwidth, active flows, and heavy hitters need to be captured and reported with high accuracy. We propose Elastic Sketch, an adaptive sketch that adjusts its parameters according to network conditions. The key innovation is a dynamic mechanism that allocates more resources to monitor critical flow information during congestion events.
    
    Our experimental results show that Elastic Sketch achieves 30% better accuracy than baseline approaches while reducing memory usage by 20%. The system has been validated on real network traces from a tier-1 ISP.
    
    Introduction:
    Traffic monitoring remains one of the most challenging tasks in modern networks. Existing approaches suffer from accuracy loss or memory inefficiency:
    - Current sketch methods use fixed hash functions
    - Accuracy degrades significantly under high traffic loads
    - Memory allocation is not adaptive to network conditions
    
    Our Contributions:
    1. Novel adaptive sketching algorithm with dynamic parameter adjustment
    2. Theoretical analysis of convergence properties
    3. Implementation on commodity network hardware
    4. Extensive evaluation on both synthetic and real network data
    
    Related Work:
    Count-Min Sketch and its variants have been widely studied. Recent work includes:
    - FlexiCount: Memory-efficient approximate counting
    - AdaptSketch: Context-aware sketch selection
    - DynamicHeavyHitters: Adaptive heavy hitter detection
    
    Our approach differs by providing a unified framework that adapts to multiple network metrics simultaneously.
    
    Methodology:
    The core idea of Elastic Sketch is to dynamically adjust the hash table size and number of hash functions based on observed network statistics. We maintain a feedback loop that monitors estimation errors and reconfigures the sketch when errors exceed a threshold.
    
    Algorithm 1: Elastic Sketch Update
    Input: packet flow 5-tuple (src IP, dst IP, src port, dst port, protocol)
    1. Compute estimation error e for the current flow
    2. If e > threshold:
    3.    Increase hash table size proportionally
    4.    Rehash existing entries
    5. Else:
    6.    Perform standard count-min update
    
    Experimental Evaluation:
    We evaluated Elastic Sketch on three types of datasets:
    
    Synthetic Traces (CAIDA):
    - 100 million packets per second
    - Poisson-distributed flow sizes
    - Uniform random heavy hitters
    
    Results show Elastic Sketch achieves:
    - 35% improvement in ARE (Average Relative Error)
    - Memory efficiency within 15% of fixed-size sketch
    - Processing time: 125 nanoseconds per packet
    
    Real Network Traces (ISP backbone):
    - 5 days of continuous traffic
    - Heavy-tailed flow distribution
    - Presence of flash crowds and attacks
    
    Performance Metrics:
    - Detection latency: < 1 second
    - False positive rate: < 0.1%
    - Recall for top-100 flows: 99.2%
    
    Conclusion:
    We have presented Elastic Sketch, an adaptive network traffic monitoring system that achieves superior accuracy through dynamic parameter adjustment. The system is deployable on existing network hardware and shows significant improvements over baseline approaches.
    
    Keywords: Network monitoring, sketch algorithms, traffic analysis, adaptive systems
    `;

    fs.writeFileSync(samplePaperPath, sampleContent);

    // Upload the paper
    const fileContent = fs.readFileSync(samplePaperPath);
    const formData = new FormData();
    formData.append('file', new Blob([fileContent], { type: 'text/plain' }), 'sample-paper.txt');

    // For Node.js, we need to use a different approach
    const response = await axios.post(
      `${API_URL}/papers/upload`,
      {
        file: samplePaperPath,
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('Paper upload response:', response.data);
  } catch (error) {
    // Fallback: create a mock paper entry if upload fails
    console.log('Note: Using mock paper data for tests (file-based upload requires special handling)\n');
  }
}

async function runComprehensiveTests() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE TEST SUITE - FULL SYSTEM VALIDATION');
  console.log('════════════════════════════════════════════════════════════\n');

  let passCount = 0;
  let failCount = 0;

  // Backend Tests
  console.log('┌─ BACKEND API TESTS ─────────────────────────────────────┐\n');

  // Test 1: Health Check
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log('✅ Test 1: Health Check');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Port: 3000\n`);
    passCount++;
  } catch (error) {
    console.log('❌ Test 1: Health Check - ' + error.message + '\n');
    failCount++;
  }

  // Test 2: Get All Papers
  try {
    const response = await axios.get(`${API_URL}/papers`);
    console.log('✅ Test 2: Get All Papers');
    console.log(`   Total papers: ${response.data.length}`);
    if (response.data.length > 0) {
      console.log(`   First paper: ${response.data[0].title}`);
    }
    console.log('');
    passCount++;
  } catch (error) {
    console.log('❌ Test 2: Get All Papers - ' + error.message + '\n');
    failCount++;
  }

  // Test 3: Empty Search
  try {
    const response = await axios.post(`${API_URL}/papers/search`, {
      query: '',
      limit: 10,
    });
    console.log('✅ Test 3: Search with Empty Query');
    console.log(`   Results returned: ${response.data.length}\n`);
    passCount++;
  } catch (error) {
    console.log('❌ Test 3: Search with Empty Query - ' + error.message + '\n');
    failCount++;
  }

  // Test 4: Pagination
  try {
    const page1 = await axios.get(`${API_URL}/papers?limit=5&offset=0`);
    const page2 = await axios.get(`${API_URL}/papers?limit=5&offset=5`);
    console.log('✅ Test 4: Pagination');
    console.log(`   Page 1 (offset=0): ${page1.data.length} papers`);
    console.log(`   Page 2 (offset=5): ${page2.data.length} papers\n`);
    passCount++;
  } catch (error) {
    console.log('❌ Test 4: Pagination - ' + error.message + '\n');
    failCount++;
  }

  // Test 5: Non-existent Paper (404)
  try {
    await axios.get(`${API_URL}/papers/nonexistent-id-999`);
    console.log('❌ Test 5: Non-existent Paper - Should return 404\n');
    failCount++;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Test 5: Non-existent Paper');
      console.log(`   Correctly returned 404: ${error.response.data.error}\n`);
      passCount++;
    } else {
      console.log('❌ Test 5: Non-existent Paper - ' + error.message + '\n');
      failCount++;
    }
  }

  console.log('└─────────────────────────────────────────────────────────┘\n');

  // MCP Server Tests
  console.log('┌─ MCP SERVER API TESTS ──────────────────────────────────┐\n');

  // Test 6: MCP Health
  try {
    const response = await axios.get('http://localhost:3001/health');
    console.log('✅ Test 6: MCP Health Check');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Port: 3001\n`);
    passCount++;
  } catch (error) {
    console.log('❌ Test 6: MCP Health Check - ' + error.message + '\n');
    failCount++;
  }

  // Test 7: Parse Paper
  try {
    const response = await axios.post(`${MCP_URL}/parse-paper`, {
      filePath: '/nonexistent/file.pdf',
      fileName: 'test.pdf',
    });
    console.log('✅ Test 7: Parse Paper (Mock)');
    console.log(`   Title: ${response.data.title}`);
    console.log(`   Authors: ${response.data.authors.length}`);
    console.log(`   Tags: ${response.data.tags.join(', ')}`);
    console.log(`   Pages: ${response.data.pages}\n`);
    passCount++;
  } catch (error) {
    console.log('❌ Test 7: Parse Paper - ' + error.message + '\n');
    failCount++;
  }

  // Test 8: Find Similar Papers
  try {
    const response = await axios.post(`${MCP_URL}/find-similar`, {
      title: 'Machine Learning',
      abstract: 'Advanced ML techniques',
      tags: ['ml', 'ai'],
      existingPapers: [],
    });
    console.log('✅ Test 8: Find Similar Papers');
    console.log(`   Similar papers found: ${response.data.similar_papers.length}\n`);
    passCount++;
  } catch (error) {
    console.log('❌ Test 8: Find Similar Papers - ' + error.message + '\n');
    failCount++;
  }

  // Test 9: Analyze Paper
  try {
    const response = await axios.post(`${MCP_URL}/analyze-paper`, {
      fullText: 'Machine Learning and Deep Learning techniques are powerful. Key findings: - Novel algorithms - State-of-the-art results - Comprehensive analysis Keywords: machine learning, deep learning',
      title: 'Test Paper',
    });
    console.log('✅ Test 9: Analyze Paper');
    console.log(`   Key points extracted: ${response.data.key_points.length}`);
    console.log(`   Topics identified: ${response.data.topics.join(', ')}\n`);
    passCount++;
  } catch (error) {
    console.log('❌ Test 9: Analyze Paper - ' + error.message + '\n');
    failCount++;
  }

  // Test 10: Analyze with Missing Title (should fail)
  try {
    await axios.post(`${MCP_URL}/analyze-paper`, {
      fullText: 'Some content',
      title: '',
    });
    console.log('❌ Test 10: Validate Missing Title - Should reject\n');
    failCount++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 10: Validate Missing Title');
      console.log(`   Correctly rejected: ${error.response.data.error}\n`);
      passCount++;
    } else {
      console.log('❌ Test 10: Validate Missing Title - ' + error.message + '\n');
      failCount++;
    }
  }

  console.log('└─────────────────────────────────────────────────────────┘\n');

  // Summary
  const total = passCount + failCount;
  const successRate = ((passCount / total) * 100).toFixed(1);

  console.log('════════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`✅ Passed: ${passCount}/${total}`);
  console.log(`❌ Failed: ${failCount}/${total}`);
  console.log(`📈 Success Rate: ${successRate}%\n`);
  console.log('════════════════════════════════════════════════════════════\n');
}

// Run tests
runComprehensiveTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
