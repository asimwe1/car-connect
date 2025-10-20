// Demo script to test the dynamic activity system
import { activityService } from '../services/activityService';

export const runActivityDemo = async () => {
  console.log('🚀 Starting Dynamic Activity System Demo...');
  console.log('✨ This demo showcases VARIED, REALISTIC activities instead of repetitive content!');

  // Subscribe to activity updates
  const unsubscribe = activityService.subscribe('activity_created', (activity) => {
    console.log('📢 New activity created:', activity.message);
  });

  // Create various types of activities with dynamic messages
  console.log('\n1. Creating varied car view activities...');
  for (let i = 0; i < 3; i++) {
    await activityService.trackCarView(`car-${Math.random().toString(36).substr(2, 5)}`, Math.random() > 0.5 ? `user-${Math.random().toString(36).substr(2, 5)}` : undefined);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to see variety
  }

  console.log('\n2. Creating varied new user activities...');
  const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
  for (let i = 0; i < 3; i++) {
    await activityService.trackNewUser(`user-${Math.random().toString(36).substr(2, 5)}`, {
      fullname: names[Math.floor(Math.random() * names.length)],
      phone: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`
    });
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n3. Creating varied booking activities...');
  for (let i = 0; i < 2; i++) {
    await activityService.trackBooking(`booking-${Math.random().toString(36).substr(2, 5)}`, `car-${Math.random().toString(36).substr(2, 5)}`, `user-${Math.random().toString(36).substr(2, 5)}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n4. Creating varied message activities...');
  for (let i = 0; i < 2; i++) {
    await activityService.trackMessage(`msg-${Math.random().toString(36).substr(2, 5)}`, `user-${Math.random().toString(36).substr(2, 5)}`, 'admin-001');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n5. Creating varied order activities...');
  for (let i = 0; i < 2; i++) {
    const amount = Math.floor(Math.random() * 50000) + 10000;
    await activityService.trackOrder(`order-${Math.random().toString(36).substr(2, 5)}`, `car-${Math.random().toString(36).substr(2, 5)}`, `user-${Math.random().toString(36).substr(2, 5)}`, amount);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n6. Generating contextual system activities...');
  await activityService.generateContextualActivities();
  await activityService.generateUserBehaviorActivities();
  await activityService.generateTimeBasedActivities();

  console.log('\n7. Generating random realistic activities...');
  await activityService.generateRandomRealisticActivities();

  // Get and display activities
  console.log('\n📊 Activity Statistics:');
  const stats = activityService.getActivityStats();
  console.log('Total activities:', stats.totalActivities);
  console.log('Activities by type:', stats.activitiesByType);
  console.log('High priority count:', stats.highPriorityCount);

  console.log('\n📋 Recent Activities (showing VARIETY):');
  const activities = activityService.getActivities();
  activities.slice(0, 10).forEach((activity, index) => {
    console.log(`${index + 1}. [${activity.type.toUpperCase()}] ${activity.message} (${activity.priority})`);
  });

  console.log('\n🔍 High Priority Activities:');
  const highPriorityActivities = activityService.getHighPriorityActivities();
  highPriorityActivities.forEach((activity, index) => {
    console.log(`${index + 1}. ${activity.message}`);
  });

  console.log('\n🎯 Key Features Demonstrated:');
  console.log('✅ Dynamic message generation (no more repetitive content)');
  console.log('✅ Activity rotation (prevents seeing same activities repeatedly)');
  console.log('✅ Time-based contextual activities');
  console.log('✅ Realistic user behavior simulation');
  console.log('✅ Varied activity types and priorities');
  console.log('✅ Geographic diversity in user activities');
  console.log('✅ Realistic car models and scenarios');

  console.log('\n✅ Dynamic Activity System Demo Complete!');
  console.log('🎉 Admin dashboard will now show VARIED, REALISTIC activities!');
  
  // Clean up
  unsubscribe();
};

// Run demo if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).runActivityDemo = runActivityDemo;
  console.log('💡 Run window.runActivityDemo() in the browser console to test the activity system');
} else {
  // Node.js environment
  runActivityDemo().catch(console.error);
}
