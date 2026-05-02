const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Context-based topic suggestions using keyword matching
const researchTopics = {
  'machine learning': [
    'Federated Learning for Privacy-Preserving Medical Diagnosis',
    'Explainable AI for Credit Risk Assessment in Banking',
    'Transfer Learning Approaches for Low-Resource NLP Tasks',
    'Adversarial Robustness in Deep Neural Networks',
    'AutoML Pipeline Optimization using Reinforcement Learning'
  ],
  'nlp': [
    'Sentiment Analysis of Urdu Social Media Text',
    'Question Answering System for Academic Research Papers',
    'Multilingual Summarization using Transformer Models',
    'Fake News Detection using Graph Neural Networks',
    'Context-Aware Chatbot for University Student Support'
  ],
  'web development': [
    'Progressive Web Application for E-Learning Platforms',
    'Real-Time Collaborative Code Editor using WebSockets',
    'Microservices Architecture for Scalable Academic Systems',
    'AI-Enhanced Search Engine for Academic Repositories',
    'Blockchain-Based Certificate Verification System'
  ],
  'cybersecurity': [
    'Intrusion Detection using Deep Learning on Network Traffic',
    'Zero-Trust Security Model for Cloud Environments',
    'Phishing Detection using Machine Learning Techniques',
    'Secure Multi-Party Computation for Data Privacy',
    'Vulnerability Assessment of IoT Devices'
  ],
  'data science': [
    'Predictive Analytics for Student Academic Performance',
    'Big Data Processing for Real-Time Health Monitoring',
    'Graph-Based Social Network Analysis for Community Detection',
    'Time Series Forecasting for Energy Consumption',
    'Data Quality Assessment Framework for Healthcare Datasets'
  ],
  'iot': [
    'Smart Campus Monitoring System Using IoT Sensors',
    'Energy-Efficient IoT Protocol for Smart Home Devices',
    'Edge Computing Framework for Industrial IoT Applications',
    'Indoor Localization System Using BLE Beacons',
    'IoT-Based Precision Agriculture Monitoring System'
  ],
  'blockchain': [
    'Decentralized Academic Credential Verification System',
    'Smart Contract-Based Research Funding Management',
    'Supply Chain Transparency Using Blockchain',
    'NFT-Based Intellectual Property Rights Management',
    'Voting System Using Blockchain for Secure Elections'
  ],
  'cloud computing': [
    'Auto-Scaling Kubernetes Cluster for Academic Workloads',
    'Serverless Architecture for Event-Driven Research Systems',
    'Multi-Cloud Data Management and Migration Framework',
    'Cost Optimization Strategies for Cloud Research Environments',
    'Cloud-Native CI/CD Pipeline for Academic Applications'
  ]
};

router.post('/topics', protect, async (req, res) => {
  try {
    const { keywords, interests, domain } = req.body;
    const inputText = `${keywords} ${interests} ${domain}`.toLowerCase();
    
    let suggestions = [];
    let matchedDomain = '';

    // Find best matching domain
    for (const [key, topics] of Object.entries(researchTopics)) {
      if (inputText.includes(key) || key.split(' ').some(w => inputText.includes(w))) {
        suggestions = [...suggestions, ...topics];
        matchedDomain = key;
        break;
      }
    }

    // If no specific match, return general suggestions
    if (suggestions.length === 0) {
      const allTopics = Object.values(researchTopics).flat();
      suggestions = allTopics.sort(() => Math.random() - 0.5).slice(0, 5);
    }

    // Shuffle and take top 5
    suggestions = suggestions.sort(() => Math.random() - 0.5).slice(0, 5);

    res.json({
      success: true,
      suggestions,
      matchedDomain: matchedDomain || 'General Research',
      message: `Found ${suggestions.length} relevant topic suggestions based on your keywords`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
