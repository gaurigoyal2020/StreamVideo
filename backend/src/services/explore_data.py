print("Step 1: importing libraries...")
from datasets import load_dataset
print("Step 2: libraries imported OK")

print("Step 3: loading dataset...")
dataset = load_dataset(
    "PolyAI/minds14",
    "en-US",
    split="train",
    streaming=True
)
print("Step 4: dataset loaded OK")

print("Step 5: fetching first sample...")
sample = next(iter(dataset))
print("Step 6: got sample!")

print("\n--- Sample contents ---")
print("Keys available:", list(sample.keys()))
print("Transcript:", sample["transcription"])
print("Audio array length:", len(sample["audio"]["array"]))
print("Sample rate:", sample["audio"]["sampling_rate"], "Hz")
print("Duration:", round(len(sample["audio"]["array"]) / sample["audio"]["sampling_rate"], 2), "seconds")