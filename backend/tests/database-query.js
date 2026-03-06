#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const MCP_URL = 'http://localhost:3001/api';

async function showDatabase() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           📊 COMPLETE DATABASE QUERY RESULTS              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Query 1: Get all papers
    console.log('📖 QUERY 1: GET ALL PAPERS');
    console.log('─'.repeat(60));
    const allPapersRes = await axios.get(`${API_URL}/papers`);
    const allPapers = allPapersRes.data;
    console.log(`Total papers in database: ${allPapers.length}\n`);

    allPapers.forEach((paper, index) => {
      console.log(`${index + 1}. Paper ID: ${paper.id}`);
      console.log(`   Title: ${paper.title}`);
      console.log(`   Created: ${paper.created_at}`);
      console.log(`   Abstract: ${(paper.abstract || 'N/A').substring(0, 80)}...`);
      console.log(`   Authors: ${JSON.stringify(paper.authors || [])}`);
      console.log(`   Tags: ${JSON.stringify(paper.tags || [])}`);
      console.log(`   Full Text Length: ${(paper.full_text || '').length} characters`);
      console.log(`   Key Points: ${(paper.key_points || []).length} items`);
      console.log(`   Pages: ${paper.pages || 'N/A'}`);
      console.log('');
    });

    if (allPapers.length > 0) {
      const paper = allPapers[0];

      // Query 2: Get specific paper details
      console.log('\n📋 QUERY 2: GET SPECIFIC PAPER DETAILS (First Paper)');
      console.log('─'.repeat(60));
      const paperRes = await axios.get(`${API_URL}/papers/${paper.id}`);
      const paperDetail = paperRes.data;
      console.log(JSON.stringify(paperDetail, null, 2));

      // Query 3: Search papers
      console.log('\n\n🔍 QUERY 3: SEARCH PAPERS');
      console.log('─'.repeat(60));
      const searchRes = await axios.post(`${API_URL}/papers/search`, {
        query: paper.title.substring(0, 5),
        limit: 10,
      });
      console.log(`Search Query: "${paper.title.substring(0, 5)}"`);
      console.log(`Results Found: ${searchRes.data.length}`);
      console.log(JSON.stringify(searchRes.data, null, 2));

      // Query 4: Get similar papers
      console.log('\n\n🔗 QUERY 4: GET SIMILAR PAPERS');
      console.log('─'.repeat(60));
      const similarRes = await axios.get(`${API_URL}/papers/${paper.id}/similar?limit=5`);
      console.log(`Similar Papers Found: ${similarRes.data.length}`);
      if (similarRes.data.length > 0) {
        console.log(JSON.stringify(similarRes.data, null, 2));
      } else {
        console.log('No similar papers found (expected - only 2 papers in DB)');
      }

      // Query 5: Get papers with pagination
      console.log('\n\n📄 QUERY 5: PAPERS WITH PAGINATION');
      console.log('─'.repeat(60));
      const page1 = await axios.get(`${API_URL}/papers?limit=1&offset=0`);
      console.log('Page 1 (limit=1, offset=0):');
      console.log(JSON.stringify(page1.data, null, 2));

      if (allPapers.length > 1) {
        const page2 = await axios.get(`${API_URL}/papers?limit=1&offset=1`);
        console.log('\nPage 2 (limit=1, offset=1):');
        console.log(JSON.stringify(page2.data, null, 2));
      }
    }

  } catch (error) {
    console.error('Error querying database:', error.message);
  }

  // MCP Server Queries
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         🔬 MCP SERVER PROCESSING TESTS                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Query 6: Parse a paper
    console.log('📝 QUERY 6: PARSE PAPER (Mock)');
    console.log('─'.repeat(60));
    const parseRes = await axios.post(`${MCP_URL}/parse-paper`, {
      filePath: '/nonexistent/paper.pdf',
      fileName: 'test-paper.pdf',
    });
    console.log('Parsed Data:');
    console.log(JSON.stringify(parseRes.data, null, 2));

    // Query 7: Find similar papers
    console.log('\n\n🔍 QUERY 7: MCP - FIND SIMILAR PAPERS');
    console.log('─'.repeat(60));
    const findSimilarRes = await axios.post(`${MCP_URL}/find-similar`, {
      title: 'Deep Learning Applications',
      abstract: 'This paper explores deep learning for computer vision tasks',
      tags: ['deep learning', 'computer vision', 'neural networks'],
      existingPapers: [],
    });
    console.log('Similar Papers Response:');
    console.log(JSON.stringify(findSimilarRes.data, null, 2));

    // Query 8: Analyze paper content
    console.log('\n\n📊 QUERY 8: MCP - ANALYZE PAPER');
    console.log('─'.repeat(60));
    const analyzeRes = await axios.post(`${MCP_URL}/analyze-paper`, {
      fullText: `
        Advanced Machine Learning Techniques
        
        Abstract:
        This paper presents novel approaches to machine learning and artificial intelligence.
        
        1. Introduction
        Machine learning has revolutionized many fields. We present new algorithms:
        - Algorithm A: Novel neural network architecture
        - Algorithm B: Improved optimization method
        - Algorithm C: Advanced feature extraction
        
        2. Methodology
        Our approach combines deep learning with reinforcement learning techniques.
        We achieve state-of-the-art results on multiple benchmarks.
        
        3. Results
        - MNIST: 99.5% accuracy
        - CIFAR-10: 96.2% accuracy
        - ImageNet: 92.1% top-1 accuracy
        
        Keywords: machine learning, deep learning, neural networks, computer vision
      `,
      title: 'Advanced Machine Learning Techniques',
    });
    console.log('Analysis Results:');
    console.log(JSON.stringify(analyzeRes.data, null, 2));

  } catch (error) {
    console.error('Error with MCP queries:', error.message);
  }

  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ QUERY EXECUTION COMPLETE                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

showDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
