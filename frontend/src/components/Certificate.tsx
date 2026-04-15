export const Certificate = ({
  fullName,
  quizTitle,
  score,
  date,
}: {
  fullName: string;
  quizTitle: string;
  score: number;
  date: string;
}) => {
  return (
    <div
      id="certificate"
      className="absolute -left-[9999px] top-0 flex flex-col items-center justify-center border-[10px] border-primary/20 bg-background p-12 text-center"
      style={{ width: "1123px", height: "794px", fontFamily: "sans-serif" }} // A4 landscape at 96dpi approx
    >
      <div className="absolute left-6 top-6 right-6 bottom-6 border-2 border-dashed border-primary/30" />
      <div className="z-10 bg-background/80 p-8">
        <h1 className="mb-2 font-heading text-5xl font-extrabold tracking-widest text-primary uppercase">
          Certificat de Réussite
        </h1>
        <p className="mb-10 text-xl text-muted-foreground">Décerné fièrement à</p>
        
        <h2 className="mb-6 font-heading text-4xl font-bold uppercase text-foreground">
          {fullName}
        </h2>
        
        <p className="mb-6 mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
          Pour avoir complété avec succès l'évaluation <span className="font-semibold text-foreground">"{quizTitle}"</span> sur la plateforme AfriSio CI avec un score exceptionnel de <span className="font-bold text-primary">{score}%</span>.
        </p>

        <div className="mt-16 flex w-full max-w-2xl justify-between px-10">
          <div className="text-center">
            <div className="border-b-2 border-foreground/30 px-6 pb-2 text-lg font-medium">{date}</div>
            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-wider">Date</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-foreground/30 px-6 pb-2 text-lg font-bold font-heading text-primary">Afrisio Team</div>
            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-wider">Signature</p>
          </div>
        </div>
      </div>
      
      {/* Decorative corner pieces */}
      <div className="absolute top-4 left-4 h-16 w-16 border-t-8 border-l-8 border-primary" />
      <div className="absolute top-4 right-4 h-16 w-16 border-t-8 border-r-8 border-primary" />
      <div className="absolute bottom-4 left-4 h-16 w-16 border-b-8 border-l-8 border-primary" />
      <div className="absolute bottom-4 right-4 h-16 w-16 border-b-8 border-r-8 border-primary" />
    </div>
  );
};
