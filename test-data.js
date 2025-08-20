const { createClient } = require('@supabase/supabase-js');

// Supabase konfigürasyonu
const supabaseUrl = 'https://mjsyncolifymfgswymip.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc3luY29saWZ5bWZnc3d5bWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzQwODEsImV4cCI6MjA3MDg1MDA4MX0.njcUGvzGTEiT1YYsLyq266dirML4BsirJKzRQ3P1kdE';

// Supabase istemcisini oluştur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllData() {
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

    // Davetleri kontrol et
    console.log('\n🎫 Davetler:');
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('*')
      .limit(10);
    
    if (invitationsError) {
      console.error('❌ Davet kontrol hatası:', invitationsError);
    } else {
      console.log(`✅ ${invitations?.length || 0} davet bulundu`);
      invitations?.forEach(inv => {
        console.log(`  - Davet ID: ${inv.id} (${inv.is_special ? 'Özel' : 'Normal'})`);
      });
    }

    console.log('\n✅ Veri kontrolü tamamlandı!');
    return true;
  } catch (error) {
    console.error('❌ Veri kontrol hatası:', error);
    return false;
  }
}

checkAllData();
