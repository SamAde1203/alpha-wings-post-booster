// /lib/linkedin.ts
export async function postToLinkedIn(accessToken: string, content: string, userId?: string) {
  try {
    console.log('Posting to LinkedIn with w_member_social scope...')
    
    // Validate inputs
    if (!accessToken) {
      return { success: false, error: 'No LinkedIn access token' }
    }
    
    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Post content is empty' }
    }
    
    // Get user URN if not provided
    let userUrn = userId
    if (!userUrn) {
      const userInfo = await getLinkedInUserInfo(accessToken)
      if (!userInfo || !userInfo.sub) {
        return { success: false, error: 'Could not get LinkedIn user info' }
      }
      userUrn = `urn:li:person:${userInfo.sub}`
    } else if (!userUrn.startsWith('urn:li:person:')) {
      userUrn = `urn:li:person:${userUrn}`
    }
    
    console.log('Posting as:', userUrn)
    
    // LinkedIn API v2 UGC Posts endpoint
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202308' // Use latest API version
      },
      body: JSON.stringify({
        author: userUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
              attributes: [] // You can add mentions, links, hashtags here
            },
            shareMediaCategory: 'NONE' // Change to 'ARTICLE', 'IMAGE', etc. if needed
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' // or 'CONNECTIONS'
        }
      })
    })
    
    const responseText = await response.text()
    console.log('LinkedIn API response:', responseText)
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      return {
        success: false,
        error: `Invalid JSON response: ${responseText.substring(0, 200)}`
      }
    }
    
    if (!response.ok) {
      console.error('LinkedIn API error details:', data)
      return {
        success: false,
        error: `LinkedIn API error: ${data.message || JSON.stringify(data)}`
      }
    }
    
    if (data.serviceErrorCode) {
      return {
        success: false,
        error: `LinkedIn service error: ${JSON.stringify(data)}`
      }
    }
    
    // Success! Extract post ID
    const postId = data.id || data.activity
    const shareUrl = `https://www.linkedin.com/feed/update/${postId}/`
    
    console.log(`✅ LinkedIn post successful: ${shareUrl}`)
    
    return {
      success: true,
      postId: postId,
      url: shareUrl,
      data: data
    }
    
  } catch (error: any) {
    console.error('LinkedIn posting error:', error)
    return {
      success: false,
      error: error.message || 'Unknown LinkedIn posting error'
    }
  }
}

// Helper function to get LinkedIn user info
async function getLinkedInUserInfo(accessToken: string) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error getting LinkedIn user info:', error)
    return null
  }
}

// Alternative: Simple text post (if UGC API has issues)
export async function postSimpleToLinkedIn(accessToken: string, content: string) {
  try {
    console.log('Posting simple text to LinkedIn...')
    
    // Get user profile to get person URN
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })
    
    const profileData = await profileResponse.json()
    if (!profileData.id) {
      return { success: false, error: 'Could not get LinkedIn user ID' }
    }
    
    const authorUrn = `urn:li:person:${profileData.id}`
    
    // Create share
    const response = await fetch('https://api.linkedin.com/v2/shares', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        content: {
          contentEntities: [{
            entityLocation: '',
            thumbnails: []
          }],
          title: 'Post from Alpha Wings'
        },
        owner: authorUrn,
        subject: 'Alpha Wings Post',
        text: {
          text: content
        },
        distribution: {
          linkedInDistributionTarget: {}
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: `LinkedIn API error: ${JSON.stringify(data)}`
      }
    }
    
    return {
      success: true,
      postId: data.id || data.activity,
      url: `https://www.linkedin.com/feed/update/${data.id || data.activity}/`
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Function to validate LinkedIn token
export async function validateLinkedInToken(accessToken: string) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        valid: true,
        user: data,
        scopes: data.scopes || []
      }
    }
    
    return {
      valid: false,
      error: `Token validation failed: ${response.status}`
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}