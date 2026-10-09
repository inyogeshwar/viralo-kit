export async function getMediaComments(mediaId: string, accessToken: string) {
  const url = `https://graph.instagram.com/v23.0/${mediaId}/comments?access_token=${accessToken}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch comments for media ${mediaId}: ${errorText}`);
  }
  
  const data = await res.json();
  return data.data || [];
}

export async function replyToComment(commentId: string, message: string, accessToken: string) {
  const url = `https://graph.instagram.com/v23.0/${commentId}/replies`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      access_token: accessToken,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to reply to comment ${commentId}: ${errorText}`);
  }

  return res.json();
}
