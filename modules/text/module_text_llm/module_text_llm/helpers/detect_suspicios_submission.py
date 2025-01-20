import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz
import os
from cryptography.fernet import Fernet
from module_text_llm.helpers.generate_embeddings import embed_text, load_embeddings_from_file

def hybrid_suspicion_score(submission, threshold=0.75):
    keywords_embeddings = load_embeddings_from_file("keyword_embeddings.npy")
    keywords = decrypt_keywords()
    # Generate embedding for the submission
    submission_embedding = embed_text(submission)
    
    # Ensure submission_embedding is a 2D array
    submission_embedding = submission_embedding.reshape(1, -1)

    # Compute cosine similarity with each keyword embedding
    similarities = cosine_similarity(submission_embedding, keywords_embeddings)
    max_similarity = np.max(similarities)

    # Fuzzy matching on keywords
    fuzzy_scores = [fuzz.partial_ratio(submission, keyword) for keyword in keywords]
    max_fuzzy_score = max(fuzzy_scores)

    # Combine the two scores
    score = (max_similarity + (max_fuzzy_score / 100)) / 2
    print(f"The score is {score}")
    return score >= threshold, max_similarity, max_fuzzy_score

def decrypt_keywords(filename="keywords_encrypted.txt"):
    encryption_key = os.getenv("ENCRYPTION_KEY") 
    if not encryption_key:
        return [""]
    
    cipher = Fernet(encryption_key)
    with open(filename, "rb") as f:
        encrypted_keywords = f.read()
    decrypted_keywords = cipher.decrypt(encrypted_keywords).decode()
    return decrypted_keywords.split(", ")