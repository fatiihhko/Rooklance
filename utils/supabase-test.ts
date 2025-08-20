import { supabase } from './supabase';

export const checkSupabaseData = async () => {
  console.log('🔍 Supabase veri durumu kontrol ediliyor...');
  
  try {
    // Kampanyaları kontrol et
    console.log('\n📊 Kampanyalar:');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .limit(10);
    
    if (campaignsError) {
      console.error('❌ Kampanya kontrol hatası:', campaignsError);
    } else {
      console.log(`✅ ${campaigns?.length || 0} kampanya bulundu`);
      campaigns?.forEach(campaign => {
        console.log(`  - ${campaign.title} (${campaign.brand})`);
      });
    }

    // Ambassador markalarını kontrol et
    console.log('\n👑 Ambassador Markaları:');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*')
      .limit(10);
    
    if (brandsError) {
      console.error('❌ Marka kontrol hatası:', brandsError);
    } else {
      console.log(`✅ ${brands?.length || 0} marka bulundu`);
      brands?.forEach(brand => {
        console.log(`  - ${brand.name} (${brand.industry})`);
      });
    }

    // Ambassador programlarını kontrol et
    console.log('\n🎯 Ambassador Programları:');
    const { data: programs, error: programsError } = await supabase
      .from('ambassador_programs')
      .select('*')
      .limit(10);
    
    if (programsError) {
      console.error('❌ Program kontrol hatası:', programsError);
    } else {
      console.log(`✅ ${programs?.length || 0} program bulundu`);
      programs?.forEach(program => {
        console.log(`  - ${program.title}`);
      });
    }

    // Ambassador görevlerini kontrol et
    console.log('\n📝 Ambassador Görevleri:');
    const { data: tasks, error: tasksError } = await supabase
      .from('ambassador_tasks')
      .select('*')
      .limit(10);
    
    if (tasksError) {
      console.error('❌ Görev kontrol hatası:', tasksError);
    } else {
      console.log(`✅ ${tasks?.length || 0} görev bulundu`);
      tasks?.forEach(task => {
        console.log(`  - ${task.title} (${task.reward_amount}₺)`);
      });
    }

    // Kullanıcıları kontrol et
    console.log('\n👤 Kullanıcılar:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(10);
    
    if (usersError) {
      console.error('❌ Kullanıcı kontrol hatası:', usersError);
    } else {
      console.log(`✅ ${users?.length || 0} kullanıcı bulundu`);
      users?.forEach(user => {
        console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
      });
    }

    // Başvuruları kontrol et
    console.log('\n📋 Başvurular:');
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .limit(10);
    
    if (applicationsError) {
      console.error('❌ Başvuru kontrol hatası:', applicationsError);
    } else {
      console.log(`✅ ${applications?.length || 0} başvuru bulundu`);
      applications?.forEach(app => {
        console.log(`  - Başvuru ID: ${app.id} (${app.status})`);
      });
    }

    // Ambassador başvurularını kontrol et
    console.log('\n🎭 Ambassador Başvuruları:');
    const { data: ambassadorApps, error: ambassadorAppsError } = await supabase
      .from('ambassador_applications')
      .select('*')
      .limit(10);
    
    if (ambassadorAppsError) {
      console.error('❌ Ambassador başvuru kontrol hatası:', ambassadorAppsError);
    } else {
      console.log(`✅ ${ambassadorApps?.length || 0} ambassador başvurusu bulundu`);
      ambassadorApps?.forEach(app => {
        console.log(`  - Başvuru ID: ${app.id} (${app.status})`);
      });
    }

    console.log('\n✅ Veri kontrolü tamamlandı!');
    return true;
  } catch (error) {
    console.error('❌ Veri kontrol hatası:', error);
    return false;
  }
};

export const clearAllData = async () => {
  console.log('🧹 Tüm veriler temizleniyor...');
  
  try {
    const tables = [
      'ambassador_task_submissions',
      'ambassador_applications',
      'ambassador_tasks',
      'ambassador_programs',
      'ambassador_profiles',
      'ambassador_levels',
      'brands',
      'transactions',
      'promo_codes',
      'wallets',
      'notifications',
      'invitations',
      'applications',
      'campaigns',
      'social_media_accounts',
      'users'
    ];

    for (const table of tables) {
      console.log(`🗑️ ${table} tablosu temizleniyor...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error(`❌ ${table} tablosu temizleme hatası:`, error);
      } else {
        console.log(`✅ ${table} tablosu temizlendi`);
      }
    }
    
    console.log('✅ Tüm veriler temizlendi!');
    return true;
  } catch (error) {
    console.error('❌ Veri temizleme hatası:', error);
    return false;
  }
};
