export async function postToLinkedIn(
  accessToken: string,
  postContent: string,
  imageUrl?: string
): Promise<{
  success: boolean
  postId?: string
  url?: string
  error?: string
}> {
  try {
    const postData = {
      author: 'urn:li:person:YOUR_PERSON_ID', // Replace with actual ID later
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: postContent },
          shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
          media: imageUrl
            ? [{
                status: 'READY',
                description: { text: 'AI-generated image' },
                media: imageUrl,
                title: { text: 'Post Image' }
              }]
            : [],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }

    const response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`)
    }

    const postId = result.elements?.[0]?.id || result.urn
    const postUrl = `https://www.linkedin.com/feed/update/${postId}/`

    return {
      success: true,
      postId,
      url: postUrl,
    }
  } catch (error: any) {
    console.error('LinkedIn post error:', error)
    return {
      success: false,
      error: error.message || 'Posting failed',
    }
  }
}
