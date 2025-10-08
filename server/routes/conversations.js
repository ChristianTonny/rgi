const express = require('express');
const { authenticateToken } = require('./auth');
const { trackAIUsage } = require('../middleware/usage-tracker');

const router = express.Router();

// In-memory storage for conversations (replace with database in production)
const conversations = new Map();
const messages = new Map();

// Shared insights storage - will be set by quick-actions module
let sharedInsights = null;

// Function to set shared insights from quick-actions
function setSharedInsights(insightsMap) {
  sharedInsights = insightsMap;
}

// Generate unique ID
function generateId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/conversations
 * List all conversations for the authenticated user
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userConversations = Array.from(conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json({
      success: true,
      data: userConversations,
      total: userConversations.length
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { title, initialMessage, context } = req.body;

    const conversationId = generateId();
    const now = new Date().toISOString();

    const conversation = {
      id: conversationId,
      userId,
      title: title || 'New Conversation',
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      isArchived: false,
      context: context || {}
    };

    conversations.set(conversationId, conversation);

    // Add initial message if provided
    if (initialMessage) {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message = {
        id: messageId,
        conversationId,
        role: 'user',
        content: initialMessage,
        metadata: {},
        createdAt: now
      };

      if (!messages.has(conversationId)) {
        messages.set(conversationId, []);
      }
      messages.get(conversationId).push(message);

      // Generate AI response
      const aiMessageId = `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;
      const aiMessage = {
        id: aiMessageId,
        conversationId,
        role: 'assistant',
        content: generateAIResponse(initialMessage, context),
        metadata: {
          model: 'rwanda-gov-ai',
          tokensUsed: 150
        },
        createdAt: new Date(Date.now() + 100).toISOString()
      };
      messages.get(conversationId).push(aiMessage);
    }

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
});

/**
 * GET /api/conversations/:id
 * Get a specific conversation with all its messages
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = conversations.get(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const conversationMessages = messages.get(id) || [];

    res.json({
      success: true,
      data: {
        ...conversation,
        messages: conversationMessages
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation'
    });
  }
});

/**
 * POST /api/conversations/:id/messages
 * Add a new message to a conversation
 */
router.post('/:id/messages', authenticateToken, trackAIUsage('chat'), (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, role = 'user' } = req.body;

    const conversation = conversations.get(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const message = {
      id: messageId,
      conversationId: id,
      role,
      content,
      metadata: {},
      createdAt: now
    };

    if (!messages.has(id)) {
      messages.set(id, []);
    }
    messages.get(id).push(message);

    // Update conversation last message time
    conversation.lastMessageAt = now;
    conversation.updatedAt = now;

    // Generate AI response if user message
    if (role === 'user') {
      setTimeout(() => {
        const aiMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const aiMessage = {
          id: aiMessageId,
          conversationId: id,
          role: 'assistant',
          content: generateAIResponse(content, conversation.context),
          metadata: {
            model: 'rwanda-gov-ai',
            tokensUsed: 180
          },
          createdAt: new Date().toISOString()
        };
        messages.get(id).push(aiMessage);
      }, 500);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add message'
    });
  }
});

/**
 * PUT /api/conversations/:id
 * Update conversation (title, archive status)
 */
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, isArchived } = req.body;

    const conversation = conversations.get(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (title !== undefined) {
      conversation.title = title;
    }

    if (isArchived !== undefined) {
      conversation.isArchived = isArchived;
    }

    conversation.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation'
    });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = conversations.get(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    conversations.delete(id);
    messages.delete(id);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    });
  }
});

/**
 * POST /api/conversations/from-insight/:insightId
 * Create a conversation from an insight (Apply Lessons functionality)
 */
router.post('/from-insight/:insightId', authenticateToken, (req, res) => {
  try {
    const { insightId } = req.params;
    const userId = req.user.id;
    
    // Get insight from shared storage
    const insights = sharedInsights || new Map();
    const insight = insights.get(insightId);
    
    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }
    
    const conversationId = generateId();
    const now = new Date().toISOString();
    
    const conversation = {
      id: conversationId,
      userId,
      title: `Applying: ${insight.title}`,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      isArchived: false,
      context: {
        type: 'lesson_application',
        insightId: insight.id,
        insight: insight
      }
    };
    
    conversations.set(conversationId, conversation);
    
    // Create initial AI message with recommendations
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const aiMessage = {
      id: messageId,
      conversationId,
      role: 'assistant',
      content: generateLessonApplicationResponse(insight),
      metadata: {
        model: 'rwanda-gov-ai',
        tokensUsed: 250,
        insightId: insight.id
      },
      createdAt: now
    };
    
    if (!messages.has(conversationId)) {
      messages.set(conversationId, []);
    }
    messages.get(conversationId).push(aiMessage);
    
    res.status(201).json({
      success: true,
      data: {
        conversation,
        initialMessage: aiMessage
      }
    });
  } catch (error) {
    console.error('Error creating conversation from insight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation from insight'
    });
  }
});

/**
 * GET /api/conversations/insights/:insightId
 * Get a specific insight by ID
 */
router.get('/insights/:insightId', authenticateToken, (req, res) => {
  try {
    const { insightId } = req.params;
    
    const insights = sharedInsights || new Map();
    const insight = insights.get(insightId);
    
    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }
    
    res.json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error('Error fetching insight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insight'
    });
  }
});

/**
 * POST /api/conversations/insights
 * Store a generated insight (for backwards compatibility)
 */
router.post('/insights', authenticateToken, (req, res) => {
  try {
    const { insight } = req.body;
    
    const insights = sharedInsights || new Map();
    insights.set(insight.id, {
      ...insight,
      userId: req.user.id,
      storedAt: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error('Error storing insight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store insight'
    });
  }
});

/**
 * Generate AI response based on user message and context
 * This is a simplified version - in production, this would call actual AI service
 */
function generateAIResponse(userMessage, context = {}) {
  const lowerMessage = userMessage.toLowerCase();

  // Context-aware responses
  if (context.type === 'opportunity_analysis') {
    return `Based on the opportunity analysis, I can provide insights on market potential, risk factors, and investment requirements. The opportunity shows promising indicators in the ${context.sector || 'specified'} sector. Would you like me to elaborate on specific aspects like ROI projections, market trends, or implementation timeline?`;
  }

  if (context.type === 'lesson_application') {
    return `I've reviewed the institutional memory insight you've selected. Here are key actionable recommendations:\n\n1. **Immediate Actions**: Review similar past projects and identify success patterns\n2. **Resource Allocation**: Consider budget adjustments based on historical data\n3. **Stakeholder Engagement**: Implement lessons learned in stakeholder management\n4. **Timeline Optimization**: Apply proven strategies to accelerate delivery\n\nWhich area would you like to explore in detail?`;
  }

  // Poverty-related queries
  if (lowerMessage.includes('poverty') || lowerMessage.includes('poor')) {
    return `Based on NISR EICV7 data, Rwanda's national poverty rate is 38.2%, with extreme poverty at 12.1%. The poverty rates vary significantly by region:\n\n- Kigali: 16.8%\n- Southern Province: 42.1% average\n- Western Province: 44.2% average\n\nWould you like detailed analysis of poverty trends, regional breakdown, or policy recommendations?`;
  }

  // Unemployment queries
  if (lowerMessage.includes('unemployment') || lowerMessage.includes('employment') || lowerMessage.includes('jobs')) {
    return `According to NISR Labour Force Survey data:\n\n- National unemployment rate: 16.7%\n- Youth unemployment (16-30): 23.4%\n- Employment rate: 78.3%\n\nKey sectors showing job growth include services (48.2% GDP contribution) and agriculture (24.5% GDP contribution). Would you like sector-specific employment data or job creation strategies?`;
  }

  // GDP and economy queries
  if (lowerMessage.includes('gdp') || lowerMessage.includes('economy') || lowerMessage.includes('growth')) {
    return `Rwanda's economic performance (NISR National Accounts):\n\n**Top Contributing Sectors:**\n- Services: 48.2% (7.8% growth)\n- Agriculture: 24.5% (5.2% growth)\n- Industry: 17.6% (6.3% growth)\n\nOverall GDP growth shows positive trends across all major sectors. Would you like detailed analysis of any specific sector or growth projections?`;
  }

  // Projects queries
  if (lowerMessage.includes('project') || lowerMessage.includes('infrastructure')) {
    return `Current project portfolio overview:\n\n- Total Projects: 42\n- Projects at Risk: 8\n- On-time Delivery Rate: 78.5%\n- Quality Score: 85.2%\n\nKey infrastructure projects include National Infrastructure Upgrade (1.5B RWF budget) and ICT Digital Transformation Initiative (800M RWF). Would you like details on specific projects or risk mitigation strategies?`;
  }

  // Budget queries
  if (lowerMessage.includes('budget') || lowerMessage.includes('spending') || lowerMessage.includes('allocation')) {
    return `Budget overview:\n\n- Total Budget: 5B RWF\n- Spent: 3.8B RWF (76%)\n- Available: 1.2B RWF (24%)\n- Efficiency Score: 87.5%\n\nBudget efficiency has improved by 12% across ministries. Would you like ministry-specific budget analysis or recommendations for resource optimization?`;
  }

  // Default response
  return `I'm here to help you analyze Rwanda's government data and provide intelligence insights. I can assist with:\n\n- Economic indicators (poverty, employment, GDP)\n- Project portfolio analysis\n- Budget and resource allocation\n- Investment opportunities\n- Policy recommendations\n\nWhat specific information would you like to explore?`;
}

/**
 * Generate lesson application response based on insight
 */
function generateLessonApplicationResponse(insight) {
  let response = `I've analyzed the insight: "${insight.title}"\n\n**Summary:**\n${insight.summary}\n\n**Actionable Recommendations:**\n\n`;
  
  if (insight.findings && insight.findings.length > 0) {
    insight.findings.forEach((finding, index) => {
      response += `${index + 1}. **${finding.category}** (Priority: ${finding.priority})\n`;
      response += `   - Insight: ${finding.insight}\n`;
      response += `   - Recommendation: ${finding.recommendation}\n\n`;
    });
  }
  
  response += `**Implementation Strategy:**\n\n`;
  response += `1. **Immediate Actions (Week 1)**\n`;
  response += `   - Review current practices against identified insights\n`;
  response += `   - Assign ownership for each recommendation\n`;
  response += `   - Schedule stakeholder meetings\n\n`;
  
  response += `2. **Short-term Goals (Month 1)**\n`;
  response += `   - Implement high-priority recommendations\n`;
  response += `   - Establish monitoring metrics\n`;
  response += `   - Document progress and challenges\n\n`;
  
  response += `3. **Success Metrics**\n`;
  response += `   - Track KPI improvements\n`;
  response += `   - Measure efficiency gains\n`;
  response += `   - Document lessons learned\n\n`;
  
  response += `Which specific recommendation would you like to explore further, or would you like help creating an implementation plan?`;
  
  return response;
}

module.exports = router;
module.exports.setSharedInsights = setSharedInsights;
