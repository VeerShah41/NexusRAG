import os
import random

# Ensure the demo_data directory exists
os.makedirs("demo_data", exist_ok=True)

themes = [
    {
        "name": "quantum_computing_research.txt",
        "topic": "Quantum Computing Basics",
        "sentences": [
            "Quantum superposition allows a qubit to exist in multiple states simultaneously.",
            "Entanglement links particles such that the state of one instantly influences another.",
            "Quantum interference is used to amplify correct paths in algorithms like Grover's.",
            "Decoherence is the primary challenge in maintaining stable quantum states.",
            "Topological qubits aim to provide fault tolerance against local perturbations.",
            "Shor's algorithm threatens classical RSA encryption by factoring large primes exponentially faster.",
            "Superconducting loops and trapped ions are leading physical implementations of qubits.",
            "Quantum supremacy refers to a quantum computer solving a problem no classical computer can in a feasible time.",
            "Error correction in quantum systems requires multiple physical qubits to form one logical qubit.",
            "Quantum annealing is specifically tailored for optimization problems."
        ]
    },
    {
        "name": "martian_colonization_plan.txt",
        "topic": "Martian Colonization Logistics",
        "sentences": [
            "The Martian atmosphere is primarily composed of carbon dioxide with trace amounts of nitrogen and argon.",
            "In-situ resource utilization (ISRU) will be critical for generating water and oxygen on Mars.",
            "Radiation shielding is necessary due to the lack of a global magnetic field and thin atmosphere.",
            "Habitats will likely be constructed underground or using 3D-printed regolith to minimize radiation exposure.",
            "The journey to Mars takes approximately 7 to 9 months using current chemical propulsion technology.",
            "Aerocapture and supersonic retropropulsion are required for safely landing heavy payloads.",
            "Solar power must be supplemented by nuclear fission reactors due to frequent global dust storms.",
            "Agriculture on Mars will require closed-loop hydroponic or aeroponic systems.",
            "Communication delays between Earth and Mars range from 4 to 24 minutes.",
            "The low gravity environment (38% of Earth's) poses long-term physiological challenges for colonists."
        ]
    },
    {
        "name": "medieval_european_history.txt",
        "topic": "Feudalism in Medieval Europe",
        "sentences": [
            "Feudalism was a decentralized sociopolitical structure based on land tenure and military service.",
            "Vassals pledged fealty to lords in exchange for a fief, which was usually a parcel of land.",
            "Serfs were peasants tied to the land, obligated to provide labor and a portion of their harvest.",
            "The manorial system served as the economic backbone, ensuring self-sufficiency for the local estate.",
            "Knights were heavily armored cavalry who formed the core of the medieval military force.",
            "The Magna Carta, signed in 1215, established the principle that everyone is subject to the law, even the king.",
            "Castles functioned as both military fortifications and administrative centers of the lord's territory.",
            "The medieval church held immense political and economic power, rivaling secular monarchs.",
            "Guilds controlled trade and manufacturing within towns, setting standards and prices.",
            "The Black Death fundamentally altered the feudal economy by creating a severe labor shortage."
        ]
    },
    {
        "name": "advanced_neural_networks.txt",
        "topic": "Deep Learning Architectures",
        "sentences": [
            "Convolutional Neural Networks (CNNs) utilize local receptive fields and shared weights for image processing.",
            "Recurrent Neural Networks (RNNs) maintain hidden states to process sequential data, though they suffer from vanishing gradients.",
            "Long Short-Term Memory (LSTM) networks introduced gating mechanisms to better retain long-term dependencies.",
            "Transformers rely entirely on self-attention mechanisms, dispensing with recurrence and convolutions.",
            "The attention mechanism calculates a weighted sum of values based on the compatibility of queries and keys.",
            "Generative Adversarial Networks (GANs) pit a generator against a discriminator in a minimax game.",
            "Batch normalization stabilizes training by re-centering and re-scaling layer inputs.",
            "Dropout prevents overfitting by randomly zeroing out activations during the forward pass.",
            "Transfer learning allows models pre-trained on massive datasets to be fine-tuned for specific tasks.",
            "Gradient descent optimizes the loss function by updating weights in the opposite direction of the gradient."
        ]
    },
    {
        "name": "oceanic_ecosystems.txt",
        "topic": "Marine Biology and Ecosystems",
        "sentences": [
            "Phytoplankton form the base of the marine food web, producing half of the world's oxygen.",
            "Coral reefs are highly diverse ecosystems built from the calcium carbonate skeletons of coral polyps.",
            "Bioluminescence is widely used in the deep sea for camouflage, attraction, and defense.",
            "Hydrothermal vents support unique communities reliant on chemosynthesis rather than photosynthesis.",
            "Upwelling brings cold, nutrient-rich water to the surface, fueling massive biological productivity.",
            "Ocean acidification, caused by absorbed carbon dioxide, impairs the ability of organisms to build shells.",
            "Mangrove forests serve as crucial nurseries for many marine species and protect coastlines from erosion.",
            "Apex predators like sharks regulate prey populations, maintaining the balance of the ecosystem.",
            "Pelagic zones represent the open ocean, characterized by vast expanses with sparse nutrient distribution.",
            "The epipelagic zone is the only layer with enough sunlight to support photosynthesis."
        ]
    },
    {
        "name": "renewable_energy_systems.txt",
        "topic": "Sustainable Energy Technologies",
        "sentences": [
            "Photovoltaic cells convert sunlight directly into electricity using semiconductor materials.",
            "Wind turbines harness kinetic energy from the wind to rotate a generator and produce power.",
            "Geothermal energy utilizes heat from the Earth's interior for electricity generation and direct heating.",
            "Hydropower relies on the gravitational potential energy of falling or flowing water.",
            "Concentrated solar power (CSP) uses mirrors to focus sunlight, generating heat to drive a steam turbine.",
            "Lithium-ion batteries remain the dominant technology for short-term grid energy storage.",
            "Pumped hydro storage accounts for the vast majority of global utility-scale energy storage capacity.",
            "Green hydrogen is produced by electrolyzing water using renewable electricity.",
            "Tidal and wave energy capture the kinetic and potential energy of ocean movements.",
            "Smart grids use digital communication technology to detect and react to local changes in usage."
        ]
    },
    {
        "name": "cryptography_fundamentals.txt",
        "topic": "Principles of Cryptography",
        "sentences": [
            "Symmetric encryption uses a single shared key for both encryption and decryption.",
            "Asymmetric encryption employs a public key for encryption and a private key for decryption.",
            "Hash functions map input data of arbitrary size to a fixed-size bit string.",
            "A cryptographic hash must be deterministic, quick to compute, and collision-resistant.",
            "Digital signatures provide authentication, non-repudiation, and data integrity.",
            "The Advanced Encryption Standard (AES) is a symmetric block cipher widely used globally.",
            "RSA algorithm relies on the practical difficulty of factoring the product of two large prime numbers.",
            "Elliptic Curve Cryptography (ECC) offers similar security to RSA but with significantly smaller key sizes.",
            "Public Key Infrastructure (PKI) manages digital certificates to establish trust over networks.",
            "A nonce is an arbitrary number used only once in a cryptographic communication to prevent replay attacks."
        ]
    }
]

for theme in themes:
    filepath = os.path.join("demo_data", theme["name"])
    with open(filepath, "w") as f:
        f.write(f"--- Document Topic: {theme['topic']} ---\n\n")
        # Generate 150 lines for each file
        for i in range(150):
            sentence = random.choice(theme["sentences"])
            f.write(f"Line {i+1}: {sentence}\n")
    print(f"Created {filepath} with 150 lines.")

print("Finished generating demo files.")
