import { PrismaClient, LeadStatus, LeadSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de leads para o Viggo CRM...');

  const sampleLeads = [
    {
      name: 'Iron Fitness Academy Morumbi',
      companyName: 'ACADEMIA DE GINASTICA IRON MORUMBI LTDA',
      cnpj: '33456789000192',
      phone: '+5511987654321',
      address: 'Av. Giovanni Gronchi, 3500 - Morumbi, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      category: 'Academia',
      decisionMaker: 'Carlos Eduardo Nogueira',
      source: LeadSource.APIFY_GMAPS,
      status: LeadStatus.DEMO_SCHEDULED,
      notes: 'Demonstração agendada para quinta-feira 14h. Sócio busca modernizar o controle de ponto dos 18 instrutores com reconhecimento facial.',
      website: 'https://www.ironfitnessmorumbi.com.br',
      rating: 4.8,
      reviewsCount: 142,
      googleMapsUrl: 'https://maps.google.com/?q=Iron+Fitness+Morumbi'
    },
    {
      name: 'Clínica Médica Santa Clara',
      companyName: 'SANTA CLARA SERVICOS MEDICOS E DIAGNOSTICOS S/S',
      cnpj: '12345678000195',
      phone: '+5511976543210',
      address: 'Rua Bela Cintra, 1200 - Consolação, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      category: 'Clínica Médica',
      decisionMaker: 'Dra. Mariana Vasconcellos',
      source: LeadSource.APIFY_GMAPS,
      status: LeadStatus.CONTACTED,
      notes: 'Mensagem enviada no WhatsApp. Administradora visualizou e solicitou apresentação comercial por PDF.',
      website: 'https://www.clinicasantaclara.med.br',
      rating: 4.9,
      reviewsCount: 88,
      googleMapsUrl: 'https://maps.google.com/?q=Clinica+Santa+Clara'
    },
    {
      name: 'Restaurante & Empório Bella Cucina',
      companyName: 'BELLA CUCINA GASTRONOMIA ITALIANA LTDA',
      cnpj: '45678912000133',
      phone: '+5511965432109',
      address: 'Rua dos Pinheiros, 450 - Pinheiros, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      category: 'Restaurante',
      decisionMaker: 'Roberto Santoro',
      source: LeadSource.APIFY_GMAPS,
      status: LeadStatus.TRIAL_ACTIVE,
      notes: 'Em período de testes de 14 dias para controle de escalas noturnas dos garçons e cozinheiros.',
      website: 'https://www.bellacucina.com.br',
      rating: 4.6,
      reviewsCount: 310,
      googleMapsUrl: 'https://maps.google.com/?q=Bella+Cucina+Pinheiros'
    },
    {
      name: 'CrossFit Alpha Prime',
      companyName: 'ALPHA PRIME CENTRO DE TREINAMENTO ESPORTIVO LTDA',
      phone: '+5511954321098',
      address: 'Alameda Araguaia, 2000 - Alphaville, Barueri - SP',
      city: 'Barueri',
      state: 'SP',
      category: 'Academia',
      decisionMaker: 'Felipe Albuquerque',
      source: LeadSource.APIFY_GMAPS,
      status: LeadStatus.NEW,
      notes: 'Lead recente extraído via Google Maps.',
      website: 'https://www.crossfitalphaprime.com.br',
      rating: 4.7,
      reviewsCount: 95
    },
    {
      name: 'Laboratório & Diagnósticos São José',
      companyName: 'LABORATORIO CLINICO SAO JOSE LTDA',
      cnpj: '78912345000166',
      phone: '+5511943210987',
      address: 'Av. Paulista, 2000 - Bela Vista, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      category: 'Laboratório',
      decisionMaker: 'Dr. Fernando Prado Martins',
      source: LeadSource.APIFY_GMAPS,
      status: LeadStatus.CONVERTED,
      notes: 'Contrato fechado! 3 unidades instaladas com biometria facial e integração com folha de pagamento.',
      website: 'https://www.labsaojose.com.br',
      rating: 4.9,
      reviewsCount: 220
    },
    {
      name: 'Bistrô & Café Parisien',
      phone: '+5511932109876',
      address: 'Rua Oscar Freire, 950 - Jardins, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      category: 'Restaurante',
      source: LeadSource.APIFY_GMAPS,
      status: LeadStatus.NEW,
      notes: 'Pendente enriquecimento de CNPJ e sócio.',
      rating: 4.5,
      reviewsCount: 160
    },
    {
      name: 'Silva & Oliveira Advogados Associados',
      companyName: 'SILVA E OLIVEIRA SOCIEDADE DE ADVOGADOS',
      cnpj: '98765432000111',
      phone: '+5511921098765',
      address: 'Av. Brigadeiro Faria Lima, 1800 - Itaim Bibi, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      category: 'Escritório de Advocacia',
      decisionMaker: 'Dr. Rodrigo de Oliveira',
      source: LeadSource.MANUAL,
      status: LeadStatus.CONTACTED,
      notes: 'Prospecção manual. Apresentado benefício de registro de ponto digital para advogados associados e estagiários.',
      website: 'https://www.silvaoliveiraadv.com.br',
      rating: 5.0,
      reviewsCount: 42
    },
    {
      name: 'Hospital Veterinário 24h PetCare',
      companyName: 'PETCARE MEDICINA VETERINARIA ESPECIALIZADA S/A',
      phone: '+5511910987654',
      address: 'Av. Rebouças, 2800 - Pinheiros, São Paulo - SP',
      city: 'São Paulo',
      state: 'SP',
      category: 'Veterinária',
      decisionMaker: 'Camila Fernandes',
      source: LeadSource.APIFY_GMAPS,
      status: LeadStatus.DEMO_SCHEDULED,
      notes: 'Equipe de 30 veterinários e plantonistas. Querem relatórios de horas extras automáticos.',
      rating: 4.7,
      reviewsCount: 512
    }
  ];

  for (const lead of sampleLeads) {
    await prisma.lead.upsert({
      where: { phone: lead.phone },
      update: lead,
      create: lead
    });
  }

  console.log(`✅ Seed concluído com ${sampleLeads.length} leads de exemplo.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
