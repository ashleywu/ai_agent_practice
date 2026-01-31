//
//  AhaCatcherApp.swift
//  Aha! Catcher - Apple Watch App
//
//  Minimal implementation using watchOS Double Tap gesture
//  Requires: watchOS 11+, Apple Watch Series 9 or Ultra 2
//

import SwiftUI
import WatchKit

@main
struct AhaCatcherApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    @State private var ahaCount = 0
    @State private var lastAhaTime: Date?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 10) {
                Text("Aha! Catcher")
                    .font(.headline)
                
                Text("\(ahaCount)")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.blue)
                
                Text("Double tap to catch!")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if let lastTime = lastAhaTime {
                    Text("Last: \(lastTime.formatted(date: .omitted, time: .shortened))")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            }
            .padding()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .navigationTitle("Aha! Catcher")
            .toolbar {
                // In watchOS 11+, this Button responds to double tap gesture
                // The system automatically handles the gesture when Button is primary action
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
        lastAhaTime = Date()
        
        // Haptic feedback
        WKInterfaceDevice.current().play(.notification)
    }
}

// MARK: - Alternative: Using Core Motion for Custom Gesture Detection
// Use this approach if you need custom gesture detection beyond double tap

import CoreMotion

class MotionGestureDetector: ObservableObject {
    private let motionManager = CMMotionManager()
    @Published var gestureDetected = false
    
    init() {
        setupMotionDetection()
    }
    
    private func setupMotionDetection() {
        guard motionManager.isDeviceMotionAvailable else {
            print("Device motion not available")
            return
        }
        
        motionManager.deviceMotionUpdateInterval = 1.0 / 30.0 // 30 Hz
        motionManager.startDeviceMotionUpdates(to: .main) { [weak self] motion, error in
            guard let motion = motion, error == nil else { return }
            
            // Detect wrist flick gesture
            // Adjust thresholds based on your needs
            let acceleration = motion.userAcceleration
            let magnitude = sqrt(
                acceleration.x * acceleration.x +
                acceleration.y * acceleration.y +
                acceleration.z * acceleration.z
            )
            
            // Threshold for detecting a "flick" gesture
            if magnitude > 1.5 {
                DispatchQueue.main.async {
                    self?.gestureDetected = true
                    // Reset after short delay
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        self?.gestureDetected = false
                    }
                }
            }
        }
    }
    
    deinit {
        motionManager.stopDeviceMotionUpdates()
    }
}

// MARK: - Enhanced Content View with Motion Detection
struct EnhancedContentView: View {
    @StateObject private var motionDetector = MotionGestureDetector()
    @State private var ahaCount = 0
    
    var body: some View {
        VStack {
            Text("Aha! Catcher")
                .font(.headline)
            
            Text("\(ahaCount)")
                .font(.system(size: 48, weight: .bold))
            
            Text("Flick wrist to catch!")
                .font(.caption)
        }
        .onChange(of: motionDetector.gestureDetected) { oldValue, newValue in
            if newValue {
                catchAha()
            }
        }
    }
    
    private func catchAha() {
        ahaCount += 1
        WKInterfaceDevice.current().play(.notification)
    }
}
