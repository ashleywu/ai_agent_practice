//
//  AudioUpload_Implementations.swift
//  Example implementations for both architectural approaches
//

import Foundation
import WatchKit
import WatchConnectivity
import AVFoundation

// MARK: - Approach 1: Direct Upload from Watch

class DirectUploadManager {
    private let cloudAPIURL = URL(string: "https://your-api.com/upload")!
    private var audioRecorder: AVAudioRecorder?
    private var recordingURL: URL?
    
    func recordAndUpload() {
        // 1. Record 30 seconds of audio
        startRecording(duration: 30.0) { [weak self] audioURL in
            guard let audioURL = audioURL else {
                print("Recording failed")
                return
            }
            
            // 2. Upload directly to cloud API
            self?.uploadToCloud(audioURL: audioURL)
        }
    }
    
    private func startRecording(duration: TimeInterval, completion: @escaping (URL?) -> Void) {
        let audioSession = AVAudioSession.sharedInstance()
        
        audioSession.requestRecordPermission { [weak self] granted in
            guard granted else {
                completion(nil)
                return
            }
            
            do {
                try audioSession.setCategory(.record, mode: .default)
                try audioSession.setActive(true)
                
                let documentsPath = FileManager.default.urls(for: .documentDirectory, 
                                                             in: .userDomainMask)[0]
                let audioFilename = documentsPath.appendingPathComponent("recording_\(Date().timeIntervalSince1970).m4a")
                
                let settings: [String: Any] = [
                    AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                    AVSampleRateKey: 16000,
                    AVNumberOfChannelsKey: 1,
                    AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue
                ]
                
                self?.audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
                self?.audioRecorder?.record(forDuration: duration)
                
                // Wait for recording to finish
                DispatchQueue.main.asyncAfter(deadline: .now() + duration + 0.5) {
                    self?.audioRecorder?.stop()
                    completion(audioFilename)
                }
                
            } catch {
                print("Recording setup failed: \(error)")
                completion(nil)
            }
        }
    }
    
    private func uploadToCloud(audioURL: URL) {
        guard let audioData = try? Data(contentsOf: audioURL) else {
            print("Failed to read audio file")
            return
        }
        
        var request = URLRequest(url: cloudAPIURL)
        request.httpMethod = "POST"
        request.setValue("audio/m4a", forHTTPHeaderField: "Content-Type")
        
        // Create multipart form data
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"audio\"; filename=\"recording.m4a\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: audio/m4a\r\n\r\n".data(using: .utf8)!)
        body.append(audioData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        // Use URLSession for upload
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Upload failed: \(error)")
                // Retry logic could go here
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                print("Upload failed with status: \((response as? HTTPURLResponse)?.statusCode ?? -1)")
                return
            }
            
            print("Upload successful!")
            
            // Clean up audio file
            try? FileManager.default.removeItem(at: audioURL)
        }
        
        task.resume()
    }
}

// MARK: - Approach 2: iPhone as Intermediary (RECOMMENDED)

class WatchConnectivityManager: NSObject, ObservableObject {
    private var session: WCSession?
    @Published var isConnected = false
    
    override init() {
        super.init()
        setupWatchConnectivity()
    }
    
    private func setupWatchConnectivity() {
        guard WCSession.isSupported() else {
            print("WatchConnectivity not supported")
            return
        }
        
        session = WCSession.default
        session?.delegate = self
        session?.activate()
    }
    
    func sendAudioToiPhone(audioURL: URL) {
        guard let session = session, session.isReachable else {
            print("iPhone not reachable, queuing transfer...")
            // transferFile will queue automatically
            session?.transferFile(audioURL, metadata: [
                "timestamp": Date().timeIntervalSince1970,
                "type": "audio"
            ])
            return
        }
        
        // iPhone is reachable, transfer immediately
        session.transferFile(audioURL, metadata: [
            "timestamp": Date().timeIntervalSince1970,
            "type": "audio"
        ])
    }
}

extension WatchConnectivityManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isConnected = (activationState == .activated)
        }
    }
    
    func session(_ session: WCSession, didFinish fileTransfer: WCSessionFileTransfer, error: Error?) {
        if let error = error {
            print("File transfer failed: \(error)")
        } else {
            print("File transfer successful!")
            // Clean up local file
            try? FileManager.default.removeItem(at: fileTransfer.file.fileURL)
        }
    }
}

// MARK: - Watch App Integration

class AhaCatcherAudioManager {
    private let connectivityManager = WatchConnectivityManager()
    private var audioRecorder: AVAudioRecorder?
    private var recordingURL: URL?
    
    func recordAndSend() {
        startRecording(duration: 30.0) { [weak self] audioURL in
            guard let audioURL = audioURL else {
                print("Recording failed")
                return
            }
            
            // Send to iPhone via WatchConnectivity
            self?.connectivityManager.sendAudioToiPhone(audioURL: audioURL)
        }
    }
    
    private func startRecording(duration: TimeInterval, completion: @escaping (URL?) -> Void) {
        let audioSession = AVAudioSession.sharedInstance()
        
        audioSession.requestRecordPermission { [weak self] granted in
            guard granted else {
                completion(nil)
                return
            }
            
            do {
                try audioSession.setCategory(.record, mode: .default)
                try audioSession.setActive(true)
                
                let documentsPath = FileManager.default.urls(for: .documentDirectory, 
                                                             in: .userDomainMask)[0]
                let audioFilename = documentsPath.appendingPathComponent("aha_\(Date().timeIntervalSince1970).m4a")
                
                let settings: [String: Any] = [
                    AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                    AVSampleRateKey: 16000,
                    AVNumberOfChannelsKey: 1,
                    AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue,
                    AVEncoderBitRateKey: 64000 // 64 kbps for smaller file size
                ]
                
                self?.audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
                self?.audioRecorder?.record(forDuration: duration)
                
                DispatchQueue.main.asyncAfter(deadline: .now() + duration + 0.5) {
                    self?.audioRecorder?.stop()
                    try? audioSession.setActive(false)
                    completion(audioFilename)
                }
                
            } catch {
                print("Recording setup failed: \(error)")
                completion(nil)
            }
        }
    }
}

// MARK: - iPhone Side Implementation (Companion App)

#if os(iOS)
import WatchConnectivity
import UserNotifications

class iPhoneUploadManager: NSObject, ObservableObject {
    private var session: WCSession?
    private let cloudAPIURL = URL(string: "https://your-api.com/upload")!
    
    override init() {
        super.init()
        setupWatchConnectivity()
    }
    
    private func setupWatchConnectivity() {
        guard WCSession.isSupported() else {
            return
        }
        
        session = WCSession.default
        session?.delegate = self
        session?.activate()
    }
    
    private func uploadToCloud(audioURL: URL, metadata: [String: Any]?) {
        guard let audioData = try? Data(contentsOf: audioURL) else {
            print("Failed to read audio file")
            return
        }
        
        // Configure background URLSession for reliable upload
        let config = URLSessionConfiguration.background(withIdentifier: "com.yourapp.audioUpload")
        config.isDiscretionary = false // Try to upload promptly
        config.sessionSendsLaunchEvents = true
        
        let session = URLSession(configuration: config, delegate: self, delegateQueue: nil)
        
        var request = URLRequest(url: cloudAPIURL)
        request.httpMethod = "POST"
        
        // Create multipart form data
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"audio\"; filename=\"recording.m4a\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: audio/m4a\r\n\r\n".data(using: .utf8)!)
        body.append(audioData)
        
        // Add metadata if available
        if let metadata = metadata, let timestamp = metadata["timestamp"] as? Double {
            body.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"timestamp\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(timestamp)".data(using: .utf8)!)
        }
        
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let task = session.uploadTask(with: request, from: body)
        task.resume()
    }
    
    private func showNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let request = UNNotificationRequest(identifier: UUID().uuidString, 
                                          content: content, 
                                          trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }
}

extension iPhoneUploadManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("WCSession activated: \(activationState == .activated)")
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {
        // Handle session becoming inactive
    }
    
    func sessionDidDeactivate(_ session: WCSession) {
        // Reactivate session
        session.activate()
    }
    
    func session(_ session: WCSession, didReceive file: WCSessionFile) {
        // Received file from Watch
        let metadata = file.metadata
        uploadToCloud(audioURL: file.fileURL, metadata: metadata)
    }
}

extension iPhoneUploadManager: URLSessionDelegate {
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let error = error {
            print("Upload failed: \(error)")
            showNotification(title: "Upload Failed", 
                           body: "Failed to upload audio recording")
        } else {
            print("Upload successful!")
            showNotification(title: "Upload Complete", 
                           body: "Audio recording uploaded successfully")
        }
    }
}
#endif

// MARK: - Updated ContentView with Audio Recording

struct ContentViewWithAudio: View {
    @StateObject private var audioManager = AhaCatcherAudioManager()
    @State private var ahaCount = 0
    @State private var isRecording = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 10) {
                Text("Aha! Catcher")
                    .font(.headline)
                
                Text("\(ahaCount)")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.blue)
                
                if isRecording {
                    Text("Recording...")
                        .font(.caption)
                        .foregroundColor(.red)
                } else {
                    Text("Double tap to catch!")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .navigationTitle("Aha! Catcher")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: catchAha) {
                        Image(systemName: "hand.tap.fill")
                    }
                }
            }
        }
    }
    
    private func catchAha() {
        ahaCount += 1
        isRecording = true
        
        // Record and send audio
        audioManager.recordAndSend()
        
        // Haptic feedback
        WKInterfaceDevice.current().play(.notification)
        
        // Reset recording state after 30 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 31) {
            isRecording = false
        }
    }
}
