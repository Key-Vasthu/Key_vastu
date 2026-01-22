-- KeyVasthu Chat Database Schema
-- This file contains the complete database schema for the chat application
-- Run this manually if automatic initialization fails

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  role VARCHAR(50) DEFAULT 'user',
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create chat_threads table
CREATE TABLE IF NOT EXISTS chat_threads (
  id VARCHAR(255) PRIMARY KEY,
  applicant_id VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  participant_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP,
  unread_count INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(applicant_id, client_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  thread_id VARCHAR(255) NOT NULL,
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'sent',
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id VARCHAR(255) PRIMARY KEY,
  message_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_threads_applicant ON chat_threads(applicant_id);
CREATE INDEX IF NOT EXISTS idx_threads_client ON chat_threads(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_attachments_message ON message_attachments(message_id);

-- Insert sample users (optional - for testing)
-- INSERT INTO users (id, email, name, role) VALUES 
--   ('user-1', 'applicant@example.com', 'Applicant User', 'user'),
--   ('user-2', 'client@example.com', 'Client User', 'user')
-- ON CONFLICT (id) DO NOTHING;


















