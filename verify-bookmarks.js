#!/usr/bin/env node

const http = require('http');

console.log('=== X 推文收藏功能验证测试 ===\n');

const tests = [
  {
    name: '1. 测试主页',
    url: 'http://localhost:3000',
    method: 'GET',
    expectedStatus: 200,
    checkContent: (body) => body.includes('收藏')
  },
  {
    name: '2. 测试公开收藏页面',
    url: 'http://localhost:3000/bookmarks/public',
    method: 'GET',
    expectedStatus: 200,
    checkContent: (body) => body.includes('公开推文收藏')
  },
  {
    name: '3. 测试保存推文页面',
    url: 'http://localhost:3000/bookmarks/save',
    method: 'GET',
    expectedStatus: 200,
    checkContent: (body) => body.includes('保存推文')
  },
  {
    name: '4. 测试 API - 获取公开推文',
    url: 'http://localhost:3000/api/bookmarks?public=true',
    method: 'GET',
    expectedStatus: 200,
    checkContent: (body) => {
      try {
        const data = JSON.parse(body);
        return data.hasOwnProperty('tweets') && data.hasOwnProperty('total');
      } catch {
        return false;
      }
    }
  },
  {
    name: '5. 测试 API - 保存推文（无认证，应返回 401）',
    url: 'http://localhost:3000/api/bookmarks',
    method: 'POST',
    expectedStatus: 401,
    body: JSON.stringify({
      url: 'https://x.com/test/status/123',
      tags: ['test'],
      notes: 'Test'
    })
  }
];

function makeRequest(test) {
  return new Promise((resolve) => {
    const url = new URL(test.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const passed = res.statusCode === test.expectedStatus && 
                      (!test.checkContent || test.checkContent(body));
        resolve({
          name: test.name,
          passed,
          status: res.statusCode,
          expectedStatus: test.expectedStatus
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name: test.name,
        passed: false,
        error: error.message
      });
    });

    if (test.body) {
      req.write(test.body);
    }
    req.end();
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await makeRequest(test);
    
    if (result.passed) {
      console.log(`✅ ${result.name}`);
      console.log(`   状态码: ${result.status} (预期: ${result.expectedStatus})`);
      passed++;
    } else {
      console.log(`❌ ${result.name}`);
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      } else {
        console.log(`   状态码: ${result.status} (预期: ${result.expectedStatus})`);
      }
      failed++;
    }
    console.log('');
  }

  console.log('=== 测试结果 ===');
  console.log(`通过: ${passed}/${tests.length}`);
  console.log(`失败: ${failed}/${tests.length}`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
