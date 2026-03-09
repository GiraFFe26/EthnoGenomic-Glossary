-- Database bootstrap for EthnoGenomic Glossary

CREATE TABLE IF NOT EXISTS terms (
    id SERIAL PRIMARY KEY,
    term_ru TEXT,
    term_en TEXT,
    definition TEXT,
    context TEXT,
    definition_en TEXT,
    context_en TEXT,
    abbreviation TEXT,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS relations (
    id SERIAL PRIMARY KEY,
    term_id INT REFERENCES terms(id) ON DELETE CASCADE,
    related_id INT REFERENCES terms(id) ON DELETE CASCADE,
    type VARCHAR(20)
);

-- Indexes for faster lookup and FTS
CREATE INDEX IF NOT EXISTS idx_terms_ru ON terms USING gin (to_tsvector('simple', coalesce(term_ru, '')));
CREATE INDEX IF NOT EXISTS idx_terms_en ON terms USING gin (to_tsvector('simple', coalesce(term_en, '')));
CREATE INDEX IF NOT EXISTS idx_terms_full ON terms USING gin (
    to_tsvector('simple',
        coalesce(term_ru,'') || ' ' ||
        coalesce(term_en,'') || ' ' ||
        coalesce(definition,'') || ' ' ||
        coalesce(definition_en,'') || ' ' ||
        coalesce(context,'') || ' ' ||
        coalesce(context_en,'')
    )
);
CREATE INDEX IF NOT EXISTS idx_relations_term ON relations(term_id);
CREATE INDEX IF NOT EXISTS idx_relations_related ON relations(related_id);

-- Seed terms (RU/EN)
INSERT INTO terms (id, term_ru, term_en, definition, context, definition_en, context_en, abbreviation, active) VALUES
  (1, 'Популяционная геномика', 'Population genomics', 'Исследование вариаций в геномах целых популяций для реконструкции истории и адаптаций.', 'Используется для анализа миграций, смешения популяций и выявления адаптивных сигналов.', 'Study of genome-wide variation across populations to reconstruct history and adaptations.', 'Used to analyze migration, admixture, and detect adaptive signals.', NULL, TRUE),
  (2, 'Митохондриальная ДНК', 'Mitochondrial DNA', 'Кольцевая молекула ДНК в митохондриях, наследуется по материнской линии.', 'Применяется для отслеживания материнских линий и древних миграций.', 'Circular DNA molecule in mitochondria, inherited maternally.', 'Used to trace maternal lineages and ancient migrations.', 'mtDNA', TRUE),
  (3, 'Y-хромосомные маркеры', 'Y-chromosome markers', 'Маркерные SNP и STR на Y-хромосоме, наследуемые по отцовской линии.', 'Используются для исследования патрилинейных связей и мужских миграций.', 'Marker SNPs and STRs on the Y chromosome inherited paternally.', 'Used to study patrilineal lineages and male migrations.', 'Y-SNP', TRUE),
  (4, 'Аутосомный SNP', 'Autosomal SNP', 'Однонуклеотидный полиморфизм в аутосомах, отражающий смешанную наследственность.', 'Подходит для оценки долей происхождения и расчета генетической дистанции.', 'Single nucleotide polymorphism in autosomes reflecting mixed ancestry.', 'Suitable for ancestry proportions and genetic distance.', NULL, TRUE),
  (5, 'Гаплогруппа', 'Haplogroup', 'Совокупность родственных гаплотипов, происходящих от общего предка.', 'Классификация линий mtDNA и Y-хромосомы в популяционных исследованиях.', 'Set of related haplotypes descending from a common ancestor.', 'Used to classify mtDNA and Y-chromosome lineages.', 'HG', TRUE),
  (6, 'Генетический дрейф', 'Genetic drift', 'Случайные изменения частот аллелей в популяции, накапливающиеся со временем.', 'Наиболее заметен в малых и изолированных группах.', 'Random changes in allele frequencies over time.', 'Most noticeable in small and isolated populations.', NULL, TRUE),
  (7, 'Основательский эффект', 'Founder effect', 'Снижение генетического разнообразия из-за происхождения популяции от малого числа предков.', 'Может приводить к необычным частотам аллелей и редким заболеваниям.', 'Reduction of genetic diversity when a population descends from few founders.', 'Can lead to unusual allele frequencies and rare diseases.', NULL, TRUE),
  (8, 'Антропогенетика', 'Anthropogenetics', 'Изучение генетических особенностей человека в эволюционном и этническом контексте.', 'Соединяет антропологию и генетику для анализа происхождения и миграций.', 'Study of human genetic features in evolutionary and ethnic context.', 'Combines anthropology and genetics to analyze origins and migrations.', NULL, TRUE),
  (9, 'Генетический маркер', 'Genetic marker', 'Участок ДНК с известной вариацией, используемый для идентификации и сопоставления.', 'Применяется в картах генома, анализе родства и популяционных исследованиях.', 'DNA locus with known variation used for identification and mapping.', 'Used in genome maps, kinship, and population studies.', NULL, TRUE),
  (10, 'Гаплотип', 'Haplotype', 'Набор совместно наследуемых аллелей на одной хромосоме.', 'Ключевой элемент для реконструкции родословных и происхождения линий.', 'Set of alleles inherited together on one chromosome.', 'Key element for lineage reconstruction and origin analysis.', NULL, TRUE),
  (11, 'Y-гаплогруппа R1a', 'Y-haplogroup R1a', 'Патрилинейная гаплогруппа, распространённая в Восточной Европе и Южной Азии.', 'Используется для изучения миграций индоевропейских популяций.', 'Paternal haplogroup common in Eastern Europe and South Asia.', 'Used to study migrations of Indo-European populations.', 'R1a', TRUE),
  (12, 'Y-гаплогруппа R1b', 'Y-haplogroup R1b', 'Патрилинейная гаплогруппа, доминирующая в Западной Европе.', 'Служит маркером для отслеживания западноевропейских линий.', 'Paternal haplogroup dominant in Western Europe.', 'Marker for tracing Western European lineages.', 'R1b', TRUE),
  (13, 'Y-гаплогруппа J2', 'Y-haplogroup J2', 'Группа, связанная с Ближним Востоком и Средиземноморьем.', 'Используется для изучения неолитических земледельцев и торговых путей.', 'Haplogroup linked to the Near East and Mediterranean.', 'Used to study Neolithic farmers and trade routes.', 'J2', TRUE),
  (14, 'Y-гаплогруппа E1b1b', 'Y-haplogroup E1b1b', 'Гаплогруппа с высоким разнообразием в Северной Африке и Европе.', 'Маркер для исследований афро-европейских контактов.', 'Haplogroup with high diversity in North Africa and Europe.', 'Marker for Afro-European contacts.', 'E1b1b', TRUE),
  (15, 'Y-гаплогруппа N1c', 'Y-haplogroup N1c', 'Гаплогруппа, характерная для финно-угорских и североевразийских народов.', 'Используется для изучения расселения по северным маршрутам.', 'Haplogroup characteristic for Finno-Ugric and North Eurasian peoples.', 'Used to study northern dispersal routes.', 'N1c', TRUE),
  (16, 'Y-гаплогруппа Q', 'Y-haplogroup Q', 'Патрилинейная линия, связанная с миграцией в Америку и Сибирь.', 'Маркер для анализа древних переходов через Берингийский перешеек.', 'Paternal lineage linked to migration into the Americas and Siberia.', 'Marker for ancient Beringian crossings.', 'Q', TRUE),
  (17, 'mtDNA гаплогруппа H', 'mtDNA haplogroup H', 'Одна из наиболее распространённых материнских линий Европы.', 'Используется в исследованиях постледниковых репопуляций.', 'One of the most common maternal lineages in Europe.', 'Used in studies of post-glacial repopulations.', NULL, TRUE),
  (18, 'mtDNA гаплогруппа U', 'mtDNA haplogroup U', 'Старая европейская материнская линия, обнаруживаемая у древних охотников-собирателей.', 'Маркер для реконструкции мезолитических популяций.', 'Ancient European maternal lineage found in hunter-gatherers.', 'Marker to reconstruct Mesolithic populations.', NULL, TRUE),
  (19, 'mtDNA гаплогруппа K', 'mtDNA haplogroup K', 'Материнская линия, часто связанная с неолитическими земледельцами.', 'Используется для отслеживания распространения земледелия.', 'Maternal lineage often linked to Neolithic farmers.', 'Used to trace the spread of farming.', NULL, TRUE),
  (20, 'mtDNA гаплогруппа T', 'mtDNA haplogroup T', 'Материнская линия Евразии с широким географическим распределением.', 'Отмечается в анализах миграций степных культур.', 'Maternal Eurasian lineage with broad distribution.', 'Noted in analyses of steppe migrations.', NULL, TRUE),
  (21, 'Древняя ДНК', 'Ancient DNA', 'Генетический материал, извлечённый из археологических образцов.', 'Позволяет напрямую изучать геном древних популяций.', 'Genetic material extracted from archaeological samples.', 'Enables direct study of ancient genomes.', NULL, TRUE),
  (22, 'Молекулярные часы', 'Molecular clock', 'Метод оценки времени дивергенции по скорости мутаций.', 'Применяется для датировки разделения линий и миграций.', 'Method estimating divergence time via mutation rate.', 'Used to date lineage splits and migrations.', NULL, TRUE),
  (23, 'Эффективная численность популяции', 'Effective population size', 'Число особей, участвующих в воспроизводстве и определяющих генетическое разнообразие.', 'Ключевая метрика для моделирования дрейфа и отбора.', 'Number of individuals contributing to reproduction and diversity.', 'Key metric for modeling drift and selection.', NULL, TRUE),
  (24, 'Генетическое бутылочное горлышко', 'Genetic bottleneck', 'Резкое сокращение численности и генетического разнообразия популяции.', 'Выявляется по снижению гетерозиготности и росту родства.', 'Sharp reduction of population size and genetic diversity.', 'Detected by decreased heterozygosity and increased relatedness.', NULL, TRUE),
  (25, 'Экспансия популяции', 'Population expansion', 'Быстрый рост численности, оставляющий сигнатуру в спектре частот аллелей.', 'Моделируется при анализе миграций и демографической истории.', 'Rapid growth leaving a signature in allele frequency spectrum.', 'Modeled in migration and demographic analyses.', NULL, TRUE),
  (26, 'Смешение популяций', 'Admixture', 'Объединение генетических пулов разных групп.', 'Определяется методами f-статистик, qpAdm, ADMIXTURE.', 'Mixing of genetic pools from different groups.', 'Identified via f-stats, qpAdm, ADMIXTURE.', NULL, TRUE),
  (27, 'Адаптивная интрогрессия', 'Adaptive introgression', 'Передача адаптивных аллелей между популяциями через смешение.', 'Изучается на примере неандертальских и денисовских вкладов.', 'Transfer of adaptive alleles via admixture.', 'Studied in Neanderthal and Denisovan contributions.', NULL, TRUE),
  (28, 'Интрогрессия', 'Introgression', 'Включение генов одной популяции в геном другой через гибридизацию.', 'Оценивается по локусам с необычным происхождением.', 'Incorporation of genes via hybridization.', 'Assessed by loci with unusual ancestry.', NULL, TRUE),
  (29, 'Миграция популяций', 'Population migration', 'Перемещение групп, формирующее новые генетические паттерны.', 'Реконструируется по сигналам смешения и структуре генофонда.', 'Movement of groups shaping genetic patterns.', 'Reconstructed from admixture signals and gene pool structure.', NULL, TRUE),
  (30, 'Структура популяции', 'Population structure', 'Наличие субпопуляций с различающимися частотами аллелей.', 'Учитывается при ассоциативных исследованиях и анализе родства.', 'Presence of subpopulations with distinct allele frequencies.', 'Accounted for in association and kinship analyses.', NULL, TRUE),
  (31, 'Кластерный анализ', 'Cluster analysis', 'Группировка индивидов по генетическому сходству.', 'Используется в построении дендрограмм и популяционных кластеров.', 'Grouping individuals by genetic similarity.', 'Used to build dendrograms and population clusters.', NULL, TRUE),
  (32, 'PCA-анализ', 'PCA analysis', 'Метод главных компонент для визуализации генетической структуры.', 'Позволяет увидеть градиенты и группы в высокомерных данных.', 'Principal component analysis to visualize genetic structure.', 'Reveals gradients and clusters in high-dimensional data.', 'PCA', TRUE),
  (33, 'ADMIXTURE-анализ', 'ADMIXTURE analysis', 'Оценка компонент происхождения на основе вероятностной модели.', 'Помогает выявлять доли разных источников у индивидов.', 'Estimation of ancestry components via probabilistic model.', 'Helps detect proportions of different sources in individuals.', NULL, TRUE),
  (34, 'Филогеография', 'Phylogeography', 'Связь филогенетических линий с географическим распределением.', 'Применяется для картирования миграционных путей.', 'Linking phylogenetic lineages to geographic distribution.', 'Used to map migration routes.', NULL, TRUE),
  (35, 'Филогенетика', 'Phylogenetics', 'Реконструкция эволюционных отношений между линиями.', 'Строит деревья на основе последовательностей ДНК.', 'Reconstruction of evolutionary relationships.', 'Builds trees from DNA sequences.', NULL, TRUE),
  (36, 'Метапопуляция', 'Metapopulation', 'Совокупность субпопуляций с ограниченным обменом генами.', 'Модель для описания динамики фрагментированных групп.', 'Set of subpopulations with limited gene flow.', 'Model for fragmented population dynamics.', NULL, TRUE),
  (37, 'Генетический ландшафт', 'Genetic landscape', 'Пространственное распределение генетического разнообразия.', 'Визуализируется через карты частот и FST.', 'Spatial distribution of genetic diversity.', 'Visualized via frequency maps and FST.', NULL, TRUE),
  (38, 'Генофонд', 'Gene pool', 'Совокупность всех аллелей популяции.', 'Используется для оценки разнообразия и изменений во времени.', 'Sum of all alleles in a population.', 'Used to assess diversity and temporal change.', NULL, TRUE),
  (39, 'Микросателлит (STR)', 'Microsatellite (STR)', 'Короткие тандемные повторы, высоковариабельные маркеры.', 'Применяются в криминалистике и исследовании родства.', 'Short tandem repeats, highly variable markers.', 'Used in forensics and kinship.', 'STR', TRUE),
  (40, 'Диагностический SNP', 'Diagnostic SNP', 'Полиморфизм, отличающий одну линию или популяцию от другой.', 'Используется для атрибуции происхождения.', 'Polymorphism distinguishing one lineage or population.', 'Used for ancestry attribution.', NULL, TRUE),
  (41, 'Контаминация ДНК', 'DNA contamination', 'Примесь чужой ДНК в образце.', 'Особенно критична для ancient DNA; требует контроля лабораторных процедур.', 'Presence of foreign DNA in a sample.', 'Critical for aDNA; requires strict lab controls.', NULL, TRUE),
  (42, 'Контроль качества данных', 'Data quality control', 'Набор процедур для фильтрации ошибок в последовательностях и генотипах.', 'Включает фильтры по покрытию, дупликатам, повреждениям.', 'Procedures to filter errors in sequences and genotypes.', 'Includes coverage, duplicates, damage filters.', NULL, TRUE),
  (43, 'Покрытие секвенирования', 'Sequencing coverage', 'Среднее количество чтений, перекрывающих позицию генома.', 'Влияет на точность выявления вариантов.', 'Average number of reads covering a genome position.', 'Affects variant call accuracy.', NULL, TRUE),
  (44, 'Средняя длина чтения', 'Mean read length', 'Средняя длина секвенированных фрагментов.', 'Короткие чтения могут ухудшать сборку и выравнивание.', 'Average length of sequenced fragments.', 'Short reads may hinder assembly and alignment.', NULL, TRUE),
  (45, 'Частота минорного аллеля', 'Minor allele frequency', 'Доля реже встречающегося аллеля в популяции.', 'Используется при фильтрации редких и частых вариантов.', 'Frequency of the less common allele in a population.', 'Used to filter rare/common variants.', 'MAF', TRUE),
  (46, 'Тест Харди-Вайнберга', 'Hardy-Weinberg test', 'Проверка соответствия генотипных частот равновесию.', 'Позволяет выявлять ошибки генотипирования и отбор.', 'Test for conformance to Hardy-Weinberg equilibrium.', 'Flags genotyping errors and selection.', NULL, TRUE),
  (47, 'FST', 'FST', 'Мера дифференциации популяций по частотам аллелей.', 'Высокие значения указывают на ограниченный генетический обмен.', 'Measure of population differentiation by allele frequencies.', 'High values indicate limited gene flow.', 'FST', TRUE),
  (48, 'Identity by descent', 'Identity by descent', 'Совпадение участков ДНК, унаследованных от общего предка.', 'Используется для оценки родства и демографии.', 'Shared DNA segments inherited from a common ancestor.', 'Used for relatedness and demographic inference.', 'IBD', TRUE),
  (49, 'Identity by state', 'Identity by state', 'Совпадение аллелей без подтверждения общего предка.', 'Отличается от IBD отсутствием информации о родстве.', 'Alleles match without evidence of common ancestor.', 'Differs from IBD by lacking relatedness info.', 'IBS', TRUE),
  (50, 'Референсная панель', 'Reference panel', 'Набор генотипов с известным происхождением для иммутации и сравнений.', 'Например, 1000 Genomes или локальные панели.', 'Set of genotypes with known ancestry for imputation and comparison.', 'E.g., 1000 Genomes or local panels.', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed relations
INSERT INTO relations (id, term_id, related_id, type) VALUES
  (1, 5, 3, 'paternal'),
  (2, 5, 2, 'maternal'),
  (3, 4, 1, 'feature'),
  (4, 6, 7, 'cause'),
  (5, 1, 6, 'process'),
  (6, 10, 5, 'hyponym'),    -- Haplotype -> Haplogroup
  (7, 5, 10, 'hypernym'),   -- Haplogroup -> Haplotype
  (8, 9, 40, 'synonym'),    -- Genetic marker ~ Diagnostic SNP
  (9, 24, 25, 'antonym'),   -- Bottleneck vs Expansion
  (10, 11, 5, 'hyponym'),   -- R1a -> Haplogroup
  (11, 12, 5, 'hyponym'),   -- R1b -> Haplogroup
  (12, 13, 5, 'hyponym'),   -- J2 -> Haplogroup
  (13, 14, 5, 'hyponym'),   -- E1b1b -> Haplogroup
  (14, 15, 5, 'hyponym'),   -- N1c -> Haplogroup
  (15, 16, 5, 'hyponym')    -- Q -> Haplogroup
ON CONFLICT (id) DO NOTHING;

-- Align sequences after manual IDs
SELECT setval(pg_get_serial_sequence('terms', 'id'), (SELECT MAX(id) FROM terms));
SELECT setval(pg_get_serial_sequence('relations', 'id'), (SELECT MAX(id) FROM relations));
