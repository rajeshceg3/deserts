import re

with open('src/components/Experience.jsx', 'r') as f:
    content = f.read()

# Remove the EffectComposer import
content = re.sub(r"import \{ EffectComposer, Bloom, Vignette, SMAA, DepthOfField, Noise, ToneMapping \} from '@react-three/postprocessing'\n", "", content)
# Remove the HeatHaze import
content = re.sub(r"import \{ HeatHaze \} from '\./effects/HeatHaze'\n", "", content)

# Remove the EffectComposer block
pattern = r"\{!isHeadless && \(\s*<EffectComposer disableNormalPass multisampling=\{0\}>\s*<SMAA \/>\s*<Bloom\s*luminanceThreshold=\{1\.1\} \/\/ Only very bright things bloom \(sun, specular\)\s*mipmapBlur\s*intensity=\{0\.4\}\s*radius=\{0\.5\}\s*\/>\s*<ToneMapping\s*mode=\{THREE\.ACESFilmicToneMapping\} \/\/ Cinematic tone mapping\s*exposure=\{1\.0\}\s*\/>\s*<DepthOfField\s*focusDistance=\{0\.05\}\s*focalLength=\{0\.02\}\s*bokehScale=\{3\}\s*\/>\s*<Noise opacity=\{0\.02\} \/>\s*<Vignette eskil=\{false\} offset=\{0\.05\} darkness=\{0\.5\} \/>\s*<HeatHaze strength=\{0\.4\} speed=\{0\.5\} \/>\s*<\/EffectComposer>\s*\)\}"

content = re.sub(pattern, "", content)

with open('src/components/Experience.jsx', 'w') as f:
    f.write(content)

print("Updated Experience.jsx")
