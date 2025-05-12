import { NextResponse } from "next/server";
import openai from "@/lib/openai";
import supabase from "@/lib/supabase";

export async function POST(request) {
  //    will be needed when new conversation is created will store the returned id then
  try {
    const { message, userId, conversationId } = await request.json();
    if (!message || !userId) {
      return NextResponse.json(
        { error: "Message and userId are required" },
        { status: 400 }
      );
    }

    let convId = conversationId;
    console.log(convId, "convId inside api ");

    // if (!convId) {
    //   // No conversationId provided → create a new conversation
    //   const { data, error: convError } = await supabase
    //     .from("conversations")
    //     .insert([
    //       {
    //         user_id: userId,
    //         title: message.slice(0, 50) || "New conversation",
    //       },
    //     ])
    //     .select("id") // Get the generated ID
    //     .single();

    //   if (convError) throw convError;
    //   console.log(data, "data returned");
    //   convId = data.id; // Use the returned ID
    //   console.log(convId, "this is returned id");
    // } else {
    //   // ConversationId was provided → check if it exists (optional, for safety)
    //   const { data: existingConv, error: checkError } = await supabase
    //     .from("conversations")
    //     .select("id")
    //     .eq("id", convId)
    //     .eq("user_id", userId) // ensure user owns it
    //     .maybeSingle();
    //   if (checkError) throw checkError;
    //   if (!existingConv) {
    //     throw new Error(
    //       "Conversation not found or does not belong to this user."
    //     );
    //   }
    // }
    // ConversationId was provided → check if it exists (optional, for safety)
    const { data: existingConv, error: checkError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", convId)
      .eq("user_id", userId) // ensure user owns it
      .maybeSingle();
    if (checkError) throw checkError;
    if (!existingConv) {
      throw new Error(
        "Conversation not found or does not belong to this user."
      );
    }

    // Fetch last 20 messages for context
    // commented for future use
    const { data: messageHistory, error: historyError } = await supabase
      .from("messages")
      .select("content, is_from_user, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (historyError) {
      console.error("Error fetching message history:", historyError);
      return NextResponse.json(
        { error: "Failed to fetch message history" },
        { status: 500 }
      );
    }
    // Format messages for OpenAI
    const systemMessage = {
      role: "system",
      content: `You are Mia, a compassionate and supportive AI assistant focused on mental health support.
        Your purpose is to provide a safe space for users to express their thoughts and feelings.
        
        Guidelines:
        - Respond with empathy and understanding
        - Ask thoughtful follow-up questions to encourage reflection
        - Offer practical coping strategies when appropriate
        - Be patient and non-judgmental
        - Provide a supportive presence
        - Keep responses concise (2-3 paragraphs maximum)
        - Use a warm, friendly tone
        
        IMPORTANT: You are not a licensed therapist or medical professional. For serious mental health concerns,
        recommend seeking professional help. If someone mentions self-harm or harming others, emphasize the 
        importance of reaching out to emergency services or a mental health crisis line.`,
    };

    // commented for future use
    const formattedHistory = messageHistory.map((msg) => ({
      role: msg.is_from_user ? "user" : "system",
      content: msg.content,
    }));

    // commented for future use
    const chatMessages = [
      systemMessage,
      ...formattedHistory,
      { role: "user", content: message },
    ];
    console.log(chatMessages, "these are chat messages");

    // const chatMessages = [systemMessage, { role: "user", content: message }];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: chatMessages,
      temperature: 0.7,
    });
    // Call OpenAI API
    // format example
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4-0125-preview",
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are a compassionate and supportive mental health chatbot.",
    //     },
    //     {
    //       role: "user",
    //       content: message,
    //     },
    //   ],
    //   temperature: 0.7,
    // });

    const aiResponse =
      completion.choices[0]?.message?.content ||
      "I'm here to listen — could you please say more?";
    if (!aiResponse) {
      return NextResponse.json(
        { error: "Failed to get response from OpenAI" },
        { status: 500 }
      );
    }
    const aiMessage = {
      content: aiResponse,
      is_from_user: false,
      user_id: userId,
    };
    console.log(aiResponse, "2.) Ai Response");
    console.log(aiMessage, "3.) Ai Message");

    // Save AI response to Supabase
    // commented for future use
    const { error: saveError } = await supabase.from("messages").insert([
      {
        content: aiResponse,
        conversation_id: convId,
        is_from_user: false,
        user_id: userId,
      },
    ]);
    if (saveError) {
      console.error("Error saving AI response:", saveError);
      return NextResponse.json(
        { error: "Failed to save AI response" },
        { status: 500 }
      );
    } else {
      return NextResponse.json({
        success: true,
        response: aiMessage, // sent back for frontend usage
        conversationId: convId,
      });
    }
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
