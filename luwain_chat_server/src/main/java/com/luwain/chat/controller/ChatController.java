package com.luwain.chat.controller;

import com.luwain.chat.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

  @MessageMapping("/chat.send")
  @SendTo("/topic/public")
  public ChatMessage broadcast(ChatMessage msg) {
    return msg;
  }
}
