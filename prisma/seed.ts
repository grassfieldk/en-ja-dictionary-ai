import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set to run the seed script.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.antonymGroupEntry.deleteMany({});
  await prisma.antonymGroup.deleteMany({});
  await prisma.synonymGroupEntry.deleteMany({});
  await prisma.synonymGroup.deleteMany({});
  await prisma.example.deleteMany({});
  await prisma.word.deleteMany({});

  // Seed Words
  const words = await prisma.word.createMany({
    data: [
      {
        id: 1,
        headword: 'run',
        pronunciation: 'rʌn',
        pos: '動詞',
        definition: '走る、逃げる、動作する、実行する',
        past: 'ran',
        past_participle: 'run',
        present_participle: 'running',
        third_person_singular: 'runs',
      },
      {
        id: 2,
        headword: 'look',
        pronunciation: 'lʊk',
        pos: '動詞',
        definition: '見る、目を向ける、〜のように見える',
      },
      {
        id: 3,
        headword: 'appear',
        pronunciation: 'əˈpɪər',
        pos: '動詞',
        definition: '現れる、〜のように見える',
      },
      {
        id: 4,
        headword: 'seem',
        pronunciation: 'siːm',
        pos: '動詞',
        definition: '〜のように思える、〜らしい',
      },
    ],
  });

  console.log(`Created ${words.count} words`);

  // Seed Examples
  const examples = await prisma.example.createMany({
    data: [
      {
        id: 1,
        word_id: 1,
        slot: 1,
        sentence_en: 'I run every morning',
        sentence_ja: '私は毎朝走る',
      },
      {
        id: 2,
        word_id: 1,
        slot: 2,
        sentence_en: 'Run!',
        sentence_ja: '走れ',
      },
      {
        id: 3,
        word_id: 1,
        slot: 3,
        sentence_en: 'I ran the script again',
        sentence_ja: '私はスクリプトを再実行した',
      },
      {
        id: 4,
        word_id: 2,
        slot: 1,
        sentence_en: 'You look happy',
        sentence_ja: '君は幸せそうに見える',
      },
      {
        id: 5,
        word_id: 3,
        slot: 1,
        sentence_en: 'She appears to be rich',
        sentence_ja: '彼女はお金持ちに見える',
      },
      {
        id: 6,
        word_id: 4,
        slot: 1,
        sentence_en: 'She seems to have a lot of fun',
        sentence_ja: '彼女はとても楽しんでいるように見える',
      },
    ],
  });

  console.log(`Created ${examples.count} examples`);

  // Seed SynonymGroup
  const synonymGroup = await prisma.synonymGroup.create({
    data: {
      id: 1,
      title: '〜にみえるを表す語',
      description: '見え方の違いによって使い分ける語',
      entries: {
        createMany: {
          data: [
            {
              id: 1,
              word: 'look',
              pos: '動詞',
              description: '客観的にそう見える',
              sentence_en: 'She looks cute',
              sentence_ja: '彼女はかわいく見える',
              order: 1,
            },
            {
              id: 2,
              word: 'appear',
              pos: '動詞',
              description: '一見そう見えるが実際は不明',
              sentence_en: 'She appears to be rich',
              sentence_ja: '彼女はお金持ちに見える',
              order: 2,
            },
            {
              id: 3,
              word: 'seem',
              pos: '動詞',
              description: '話し手の主観としてそう見える',
              sentence_en: 'She seems to have a lot of fun',
              sentence_ja: '彼女はとても楽しんでいるように見える',
              order: 3,
            },
          ],
        },
      },
    },
  });

  console.log(`Created synonym group: ${synonymGroup.id}`);

  // Seed AntonymGroup
  const antonymGroup = await prisma.antonymGroup.create({
    data: {
      id: 1,
      title: '動作と停止',
      description: '動き続ける状態と止まる状態の対比',
      entries: {
        createMany: {
          data: [
            {
              id: 1,
              word: 'run',
              pos: '動詞',
              description: '動作している状態',
              sentence_en: 'He started to run',
              sentence_ja: '彼は走り始めた',
              order: 1,
            },
            {
              id: 2,
              word: 'stop',
              pos: '動詞',
              description: '動作をやめる状態',
              sentence_en: 'He suddenly stopped',
              sentence_ja: '彼は突然立ち止まった',
              order: 2,
            },
          ],
        },
      },
    },
  });

  console.log(`Created antonym group: ${antonymGroup.id}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
